import { AuditFinding } from '../types';

const BUILTIN_MODULES = new Set([
  'os', 'sys', 'time', 're', 'json', 'math', 'typing', 'pathlib', 'random',
  'datetime', 'subprocess', 'io', 'shutil', 'urllib', 'http', 'logging',
  'unittest', 'collections', 'itertools', 'functools', 'copy', 'hashlib',
  'fs', 'path', 'crypto', 'http', 'https', 'stream', 'events', 'util', 'buffer'
]);

const POPULAR_PACKAGES = [
  // Python top packages
  'requests', 'urllib3', 'flask', 'django', 'fastapi', 'numpy', 'pandas',
  'pytest', 'pydantic', 'cryptography', 'boto3', 'celery', 'redis', 'sqlalchemy',
  'scipy', 'scikit-learn', 'tensorflow', 'torch', 'pillow', 'aiohttp', 'httpx',
  // JavaScript / TypeScript top packages
  'express', 'lodash', 'axios', 'react', 'react-dom', 'next', 'vue',
  'dotenv', 'jsonwebtoken', 'bcrypt', 'mongoose', 'ethers', 'web3',
  'chalk', 'commander', 'moment', 'dayjs', 'zod', 'uuid', 'cors', 'hono'
];

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

interface ExtractedDep {
  name: string;
  line: number;
  snippet: string;
}

export function scanTyposquatting(code: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const lines = code.split('\n');
  const extractedDeps: ExtractedDep[] = [];

  // Parse imports from code lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Python: `import requests` or `from requests import ...`
    const pyMatch = line.match(/^(?:import\s+([a-zA-Z0-9_-]+)|from\s+([a-zA-Z0-9_-]+)\s+import)/);
    if (pyMatch) {
      const pkg = pyMatch[1] || pyMatch[2];
      extractedDeps.push({ name: pkg.toLowerCase(), line: i + 1, snippet: line });
      continue;
    }

    // JS/TS: `require('express')` or `import ... from 'express'`
    const jsMatch = line.match(/(?:require\s*\(\s*['"]([@a-zA-Z0-9_/-]+)['"]\s*\)|from\s*['"]([@a-zA-Z0-9_/-]+)['"])/);
    if (jsMatch) {
      const pkg = jsMatch[1] || jsMatch[2];
      // remove subpath e.g. lodash/clone
      const basePkg = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
      extractedDeps.push({ name: basePkg.toLowerCase(), line: i + 1, snippet: line });
    }
  }

  for (const dep of extractedDeps) {
    // If it's a built-in module or exact match with popular package, it's legitimate
    if (BUILTIN_MODULES.has(dep.name) || POPULAR_PACKAGES.includes(dep.name)) {
      continue;
    }

    for (const pop of POPULAR_PACKAGES) {
      // Calculate distance
      const distance = levenshteinDistance(dep.name, pop);
      // Distance of 1 or 2 indicates potential typosquatting
      if (distance > 0 && distance <= 2 && Math.abs(dep.name.length - pop.length) <= 2) {
        findings.push({
          id: `TYPO-${dep.line}`,
          category: 'typosquat',
          severity: 'critical',
          title: `Potential Typosquatting Package: '${dep.name}' (Similar to '${pop}')`,
          description: `Package '${dep.name}' is suspiciously close to popular package '${pop}' (Levenshtein distance: ${distance}). This is a common software supply-chain attack vector.`,
          line: dep.line,
          lineEnd: dep.line,
          snippet: dep.snippet,
          packageName: dep.name,
          remediation: `Verify if you meant to install and import '${pop}' instead of '${dep.name}'.`,
          cweId: 'CWE-1357',
          confidence: 'high',
        });
        break;
      }
    }
  }

  return findings;
}
