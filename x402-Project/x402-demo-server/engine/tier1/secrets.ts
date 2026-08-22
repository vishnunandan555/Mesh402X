import { AuditFinding } from '../types';

interface SecretRule {
  id: string;
  title: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium';
  cweId: string;
  description: string;
  remediation: string;
}

const SECRET_RULES: SecretRule[] = [
  {
    id: 'SEC-001',
    title: 'Exposed AWS Access Key ID',
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: 'critical',
    cweId: 'CWE-798',
    description: 'Found an active AWS Access Key ID directly in source code.',
    remediation: 'Immediately rotate this key in AWS IAM and move credentials to environment variables (.env) or AWS Secrets Manager.',
  },
  {
    id: 'SEC-002',
    title: 'Exposed OpenAI / LLM API Key',
    pattern: /\b(sk-[a-zA-Z0-9_-]{20,})\b/g,
    severity: 'critical',
    cweId: 'CWE-798',
    description: 'Found a hardcoded OpenAI or compatible LLM API Key.',
    remediation: 'Revoke and rotate this key immediately. Access keys via `process.env.OPENAI_API_KEY` or `os.environ.get("OPENAI_API_KEY")`.',
  },
  {
    id: 'SEC-003',
    title: 'Exposed GitHub Personal Access Token',
    pattern: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{22,})\b/g,
    severity: 'critical',
    cweId: 'CWE-798',
    description: 'Found a hardcoded GitHub Personal Access Token.',
    remediation: 'Revoke the token in GitHub Developer Settings and use environment variables or GitHub Secrets in CI/CD.',
  },
  {
    id: 'SEC-004',
    title: 'Exposed Cryptographic Private Key',
    pattern: /-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP|PRIVATE) KEY[^-]*-----/g,
    severity: 'critical',
    cweId: 'CWE-312',
    description: 'Found a raw cryptographic private key embedded in the source code.',
    remediation: 'Never store private keys in code repositories. Load keys from secure key stores (HashiCorp Vault, AWS KMS) or secure files outside git.',
  },
  {
    id: 'SEC-005',
    title: 'Hardcoded JSON Web Token (JWT)',
    pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
    severity: 'high',
    cweId: 'CWE-798',
    description: 'Found a hardcoded JWT token. If valid, this grants authenticated session access.',
    remediation: 'Remove hardcoded tokens and generate ephemeral session JWTs on demand.',
  },
  {
    id: 'SEC-006',
    title: 'Hardcoded Password / Secret Variable',
    pattern: /(?:password|passwd|secret|api_key|apikey|auth_token)\s*(?:=|:)\s*["']([^"'\s]{5,})["']/gi,
    severity: 'high',
    cweId: 'CWE-798',
    description: 'Found hardcoded sensitive credentials assigned directly in variable assignment.',
    remediation: 'Move sensitive credentials to environment variables.',
  },
  {
    id: 'SEC-007',
    title: 'Exposed Slack / Discord Webhook URL',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[0-9a-zA-Z]+\/B[0-9a-zA-Z]+\/[0-9a-zA-Z]+/g,
    severity: 'high',
    cweId: 'CWE-200',
    description: 'Found an exposed incoming Slack webhook URL allowing unauthorized message posting.',
    remediation: 'Store webhook URLs in environment variables and restrict channel permissions.',
  },
];

function maskSecret(secret: string): string {
  if (secret.length <= 8) return '***';
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-3);
  return `${prefix}***${suffix}`;
}

export function scanSecrets(code: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const lines = code.split('\n');

  for (const rule of SECRET_RULES) {
    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];
      rule.pattern.lastIndex = 0; // reset regex state

      let match: RegExpExecArray | null;
      while ((match = rule.pattern.exec(lineContent)) !== null) {
        const rawSecret = match[1] || match[0];
        const masked = maskSecret(rawSecret);
        const safeSnippet = lineContent.replace(rawSecret, masked).trim();

        findings.push({
          id: `${rule.id}-${i + 1}`,
          category: 'secret',
          severity: rule.severity,
          title: rule.title,
          description: `${rule.description} (Detected: ${masked})`,
          line: i + 1,
          lineEnd: i + 1,
          snippet: safeSnippet,
          remediation: rule.remediation,
          cweId: rule.cweId,
          confidence: 'high',
        });
      }
    }
  }

  return findings;
}
