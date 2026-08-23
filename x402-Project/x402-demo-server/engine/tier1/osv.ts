import { AuditFinding, AuditLanguage } from '../types';

interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  database_specific?: {
    severity?: string;
    cwe_ids?: string[];
  };
  severity?: Array<{
    type: string;
    score: string;
  }>;
}

interface OsvQueryResponse {
  vulns?: OsvVulnerability[];
}

interface PackageVersion {
  name: string;
  version?: string;
  ecosystem: 'npm' | 'PyPI' | 'Pub' | 'Go' | 'crates.io' | 'Packagist' | 'Maven';
  line?: number;
  snippet?: string;
}

function parseDependencies(code: string, language?: AuditLanguage, manifestContent?: string, filename?: string): PackageVersion[] {
  const deps: PackageVersion[] = [];
  const lines = code.split('\n');

  // If manifestContent or filename is provided
  if (manifestContent || filename?.endsWith('.json')) {
    try {
      const parsed = JSON.parse(manifestContent || code);
      const allDeps = { ...parsed.dependencies, ...parsed.devDependencies };
      for (const [pkg, ver] of Object.entries(allDeps)) {
        const cleanVer = (ver as string).replace(/^[\^~>=<]/, '');
        deps.push({ name: pkg, version: cleanVer, ecosystem: 'npm' });
      }
    } catch {
      // Manifest not JSON, ignore
    }
  }

  let inPubDependencies = false;

  // Parse lines in code for imports, requirements, pubspec, Cargo, go.mod
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Pubspec.yaml parser (Dart / Flutter)
    if (filename?.includes('pubspec') || line.startsWith('dependencies:') || line.startsWith('dev_dependencies:')) {
      if (line === 'dependencies:' || line === 'dev_dependencies:') {
        inPubDependencies = true;
        continue;
      } else if (inPubDependencies && line.endsWith(':') && !line.includes(' ')) {
        inPubDependencies = false;
      }

      if (inPubDependencies) {
        const pubMatch = line.match(/^([a-zA-Z0-9_]+)\s*:\s*[\^~>=<]*([0-9a-zA-Z_.-]+)/);
        if (pubMatch && pubMatch[1] !== 'flutter' && pubMatch[1] !== 'sdk') {
          deps.push({
            name: pubMatch[1],
            version: pubMatch[2],
            ecosystem: 'Pub',
            line: i + 1,
            snippet: line,
          });
          continue;
        }
      }
    }

    // Go.mod parser: `require github.com/gin-gonic/gin v1.9.0`
    const goModMatch = line.match(/(?:require\s+)?([a-zA-Z0-9._/-]+)\s+v([0-9a-zA-Z_.-]+)/);
    if (goModMatch && (filename?.endsWith('go.mod') || language === 'go')) {
      deps.push({
        name: goModMatch[1],
        version: goModMatch[2],
        ecosystem: 'Go',
        line: i + 1,
        snippet: line,
      });
      continue;
    }

    // Cargo.toml parser (Rust): `serde = "1.0.104"`
    const cargoMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*["'][\^~>=<]*([0-9a-zA-Z_.-]+)["']/);
    if (cargoMatch && (filename?.endsWith('Cargo.toml') || language === 'rust')) {
      deps.push({
        name: cargoMatch[1],
        version: cargoMatch[2],
        ecosystem: 'crates.io',
        line: i + 1,
        snippet: line,
      });
      continue;
    }

    // Python requirements.txt format: `requests==2.20.0` or `flask>=2.0.0`
    const reqMatch = line.match(/^([a-zA-Z0-9_-]+)(?:==|>=|<=|~=)([0-9a-zA-Z_.-]+)/);
    if (reqMatch) {
      deps.push({
        name: reqMatch[1],
        version: reqMatch[2],
        ecosystem: 'PyPI',
        line: i + 1,
        snippet: line,
      });
      continue;
    }

    // Python import: `import requests` or `from flask import ...`
    const pyImport = line.match(/^(?:import|from)\s+([a-zA-Z0-9_-]+)/);
    if (pyImport && (language === 'python' || !language)) {
      deps.push({
        name: pyImport[1],
        ecosystem: 'PyPI',
        line: i + 1,
        snippet: line,
      });
      continue;
    }

    // JS/TS import: `require('axios')` or `from 'axios'`
    const jsImport = line.match(/(?:require\s*\(\s*['"]([@a-zA-Z0-9_/-]+)['"]\s*\)|from\s*['"]([@a-zA-Z0-9_/-]+)['"])/);
    if (jsImport && (language === 'javascript' || language === 'typescript' || !language)) {
      const pkg = jsImport[1] || jsImport[2];
      const basePkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
      deps.push({
        name: basePkg,
        ecosystem: 'npm',
        line: i + 1,
        snippet: line,
      });
    }
  }

  return deps;
}

export async function scanOsvVulnerabilities(
  code: string,
  language?: AuditLanguage,
  manifestContent?: string,
  filename?: string
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const deps = parseDependencies(code, language, manifestContent, filename);

  if (deps.length === 0) {
    return findings;
  }

  // Deduplicate deps by name & ecosystem
  const uniqueDeps = new Map<string, PackageVersion>();
  for (const d of deps) {
    const key = `${d.ecosystem}:${d.name}`;
    if (!uniqueDeps.has(key) || (d.version && !uniqueDeps.get(key)?.version)) {
      uniqueDeps.set(key, d);
    }
  }

  const queryPromises = Array.from(uniqueDeps.values()).slice(0, 8).map(async (dep) => {
    try {
      const payload: Record<string, unknown> = {
        package: {
          name: dep.name,
          ecosystem: dep.ecosystem,
        },
      };

      if (dep.version) {
        payload.version = dep.version;
      }

      const res = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) return;

      const data: OsvQueryResponse = await res.json();
      if (!data.vulns || data.vulns.length === 0) return;

      // Extract up to 2 vulnerabilities per package to avoid noise
      for (const vuln of data.vulns.slice(0, 2)) {
        const cveId = vuln.aliases?.find((a) => a.startsWith('CVE-')) || vuln.id;
        const cweId = vuln.database_specific?.cwe_ids?.[0] || 'CWE-1395';
        
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'high';
        const rawSev = vuln.database_specific?.severity?.toUpperCase();
        if (rawSev === 'CRITICAL') severity = 'critical';
        else if (rawSev === 'MODERATE' || rawSev === 'MEDIUM') severity = 'medium';
        else if (rawSev === 'LOW') severity = 'low';

        findings.push({
          id: `OSV-${vuln.id}`,
          category: 'vulnerability',
          severity,
          title: `Known Vulnerability in ${dep.name}: ${cveId}`,
          description: vuln.summary || vuln.details?.slice(0, 200) || `Known security vulnerability affecting ${dep.name}.`,
          packageName: dep.name,
          line: dep.line,
          lineEnd: dep.line,
          snippet: dep.snippet || `import ${dep.name}`,
          cveId,
          cweId,
          remediation: `Upgrade '${dep.name}' to the latest patched version and run security audit.`,
          confidence: dep.line ? 'high' : 'medium',
        });
      }
    } catch {
      // Graceful ignore network timeout for OSV queries
    }
  });

  await Promise.allSettled(queryPromises);
  return findings;
}
