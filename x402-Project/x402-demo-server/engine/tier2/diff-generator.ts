import { AuditDiffFix, AuditFinding } from '../types';

/**
 * Generates unified git diff patches from code findings.
 */
export function generateUnifiedDiffs(
  code: string,
  findings: AuditFinding[],
  filename = 'source_code'
): AuditDiffFix[] {
  const fixes: AuditDiffFix[] = [];
  const lines = code.split('\n');

  for (const finding of findings) {
    if (!finding.line || finding.line > lines.length) continue;

    const targetLineIdx = finding.line - 1;
    const originalLine = lines[targetLineIdx];
    let fixedLine = originalLine;
    let explanation = finding.remediation;

    // Pattern-specific automated fixes
    if (finding.category === 'secret') {
      const isPython = filename.endsWith('.py');
      const varNameMatch = originalLine.match(/^([a-zA-Z0-9_]+)\s*=/);
      const varName = varNameMatch ? varNameMatch[1] : 'SECRET_KEY';
      if (isPython) {
        fixedLine = `${varName} = os.environ.get("${varName}")  # Loaded from environment variable`;
      } else {
        fixedLine = `const ${varName} = process.env.${varName}; // Loaded from environment variable`;
      }
      explanation = 'Replaced hardcoded secret credential with environment variable lookup.';
    } else if (finding.id.startsWith('PAT-001')) {
      // SQL Injection fix
      fixedLine = originalLine
        .replace(/["']([^"']*=\s*)'["']\s*\+\s*([a-zA-Z0-9_]+)\s*\+\s*["']'["']/, '"$1?", ($2,)')
        .replace(/f(["'][^"']*)(\{[^}]+\})([^"']*["'])/, '"$1%s$3", (user_param,)')
        .replace(/["']([^"']*)["']\s*\+\s*([a-zA-Z0-9_]+)/, '"$1%s", ($2,)');
      explanation = 'Converted dynamic string interpolation to parameterized prepared statement.';
    } else if (finding.id.startsWith('PAT-002')) {
      // eval fix
      fixedLine = originalLine.replace(/eval\(([^)]+)\)/, 'JSON.parse($1)');
      explanation = 'Replaced dangerous eval() with safe JSON.parse().';
    } else if (finding.id.startsWith('PAT-003')) {
      // pickle/yaml fix
      fixedLine = originalLine.replace(/yaml\.load\(([^)]+)\)/, 'yaml.safe_load($1)');
      explanation = 'Switched to safe deserializer yaml.safe_load().';
    } else if (finding.category === 'typosquat' && finding.packageName) {
      // Typosquat fix: replace typosquatted package with the legitimate popular package
      const match = finding.title.match(/Similar to '([^']+)'/);
      if (match) {
        const legitimatePkg = match[1];
        fixedLine = originalLine.replace(new RegExp(`\\b${finding.packageName}\\b`, 'g'), legitimatePkg);
        explanation = `Replaced suspicious typosquatted dependency '${finding.packageName}' with verified package '${legitimatePkg}'.`;
      }
    }

    if (fixedLine !== originalLine) {
      const startLineNum = Math.max(1, finding.line - 1);
      const diffContent = [
        `--- a/${filename}`,
        `+++ b/${filename}`,
        `@@ -${finding.line},1 +${finding.line},1 @@`,
        `- ${originalLine.trim()}`,
        `+ ${fixedLine.trim()}`,
      ].join('\n');

      fixes.push({
        findingId: finding.id,
        filePath: filename,
        diff: diffContent,
        explanation,
      });
    }
  }

  return fixes;
}
