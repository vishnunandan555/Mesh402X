import { AuditFinding, AuditLanguage } from '../types';

interface PatternRule {
  id: string;
  title: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  languages?: AuditLanguage[];
  cweId: string;
  description: string;
  remediation: string;
}

const PATTERN_RULES: PatternRule[] = [
  // ── SQL Injection ──────────────────────────────────────────────────────────
  {
    id: 'PAT-001',
    title: 'SQL Injection via String Concatenation / Interpolation',
    pattern: /(?:"[^"]*(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b[^"]*"\s*\+|'[^']*(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b[^']*'\s*\+|\+\s*(?:"[^"]*\b(?:FROM|WHERE|SELECT|INSERT|UPDATE|DELETE)\b[^"]*"|'[^']*\b(?:FROM|WHERE|SELECT|INSERT|UPDATE|DELETE)\b[^']*')|f(?:"[^"]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^"]*\{|'[^']*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^']*\{)|`[^`]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^`]*\$\{|(?:cursor\.execute|conn\.execute|db\.query|sequelize\.query|execute_sql)\s*\(\s*(?:f["']|["'][^"']*["']\s*\+|`[^`]*\$\{)|(?:"[^"]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^"]*"|'[^']*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^']*')\s*(?:\.format\s*\(|%\s*(?:\(|[a-zA-Z0-9_])))/i,
    severity: 'critical',
    cweId: 'CWE-89',
    description: 'Dynamic SQL query constructed with string concatenation, template literals, or f-strings instead of parameterized queries.',
    remediation: 'Use parameterized queries / prepared statements (e.g. `cursor.execute("SELECT * FROM users WHERE username = ?", (username,))`).',
  },
  // ── Dynamic Code Execution ────────────────────────────────────────────────
  {
    id: 'PAT-002',
    title: 'Dynamic Code Execution via eval() / exec()',
    pattern: /\b(?:eval|exec|new Function)\s*\(\s*[^()]+?\)/g,
    severity: 'critical',
    cweId: 'CWE-95',
    description: 'Use of `eval()` or `exec()` allows arbitrary code execution if untrusted input reaches this call site.',
    remediation: 'Avoid `eval()` / `exec()`. Use structured JSON parsers (e.g., `JSON.parse` or `ast.literal_eval`) instead.',
  },
  // ── Insecure Deserialization ───────────────────────────────────────────────
  {
    id: 'PAT-003',
    title: 'Insecure Object Deserialization',
    pattern: /(?:pickle\.loads?|yaml\.load\s*\([^,)]+?(?:Loader\s*=\s*(?:yaml\.)?Loader)?\)|unserialize\s*\(|marshal\.loads\()/g,
    severity: 'critical',
    cweId: 'CWE-502',
    description: 'Deserializing untrusted data with `pickle` or `yaml.load` can trigger arbitrary remote code execution.',
    remediation: 'Use `yaml.safe_load()` or JSON serialization instead of `pickle` / default YAML loaders.',
  },
  // ── Command Injection ──────────────────────────────────────────────────────
  {
    id: 'PAT-004',
    title: 'OS Command Injection Hazard',
    pattern: /(?:os\.system\s*\(|subprocess\.(?:Popen|run|call|check_output)\s*\([^)]*(?:shell\s*=\s*True|f["']|["']\s*\+)|child_process\.(?:exec|execSync)\s*\()/g,
    severity: 'high',
    cweId: 'CWE-78',
    description: 'Executing shell commands with string interpolation or `shell=True` enables command injection.',
    remediation: 'Pass arguments as a safe array/list without a shell (e.g., `subprocess.run(["ls", "-la"], shell=False)`).',
  },
  // ── Path Traversal ────────────────────────────────────────────────────────
  {
    id: 'PAT-005',
    title: 'Path Traversal / Arbitrary File Access Hazard',
    pattern: /(?:open|fs\.readFile|fs\.readFileSync|fs\.writeFile|fs\.writeFileSync)\s*\(\s*(?:f["'][^"']*\{|["'][^"']*["']\s*\+|`[^`]*\$\{)/g,
    severity: 'high',
    cweId: 'CWE-22',
    description: 'Constructing file paths with unvalidated string concatenation allows path traversal (`../`) attacks.',
    remediation: 'Validate input against an allowlist and use safe path resolution (`path.resolve` with root directory verification).',
  },
  // ── React / Web XSS ────────────────────────────────────────────────────────
  {
    id: 'PAT-006',
    title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/g,
    severity: 'high',
    languages: ['javascript', 'typescript'],
    cweId: 'CWE-79',
    description: 'Injecting raw unescaped HTML directly into the DOM can lead to client-side Cross-Site Scripting (XSS).',
    remediation: 'Sanitize HTML with DOMPurify before rendering, or use standard React text nodes.',
  },
  // ── Weak Cryptography / Hashing ───────────────────────────────────────────
  {
    id: 'PAT-007',
    title: 'Use of Broken/Weak Cryptographic Hash (MD5 / SHA-1)',
    pattern: /(?:hashlib\.(?:md5|sha1)|crypto\.createHash\s*\(\s*['"](?:md5|sha1)['"]\s*\))/gi,
    severity: 'medium',
    cweId: 'CWE-328',
    description: 'MD5 and SHA-1 have known collision vulnerabilities and must not be used for security or password hashing.',
    remediation: 'Use secure algorithms such as SHA-256 (`hashlib.sha256`) or Argon2 / bcrypt for passwords.',
  },
  // ── Prototype Pollution ───────────────────────────────────────────────────
  {
    id: 'PAT-008',
    title: 'Potential Prototype Pollution Vulnerability',
    pattern: /(?:__proto__|constructor\.prototype)\s*\[/g,
    severity: 'high',
    languages: ['javascript', 'typescript'],
    cweId: 'CWE-1321',
    description: 'Modifying `__proto__` or prototype properties on objects can pollute global prototypes.',
    remediation: 'Use `Object.create(null)` or `Map` data structures for dynamic key-value storage.',
  },
  // ── Solidity / Smart Contract Hazards ─────────────────────────────────────
  {
    id: 'PAT-009',
    title: 'Insecure Authorization via tx.origin in Smart Contract',
    pattern: /\btx\.origin\b/g,
    languages: ['solidity'],
    severity: 'high',
    cweId: 'CWE-287',
    description: 'Using `tx.origin` for authentication allows phishing contracts to bypass authorization.',
    remediation: 'Use `msg.sender` instead of `tx.origin` to authenticate callers in Solidity contracts.',
  },
  // ── Algorand Smart Contract Hazards ────────────────────────────────────────
  {
    id: 'PAT-010',
    title: 'Algorand: Unchecked RekeyTo or AssetCloseTo Hazard',
    pattern: /(?:TxnField\.rekey_to|TxnField\.asset_close_to|TxnField\.close_remainder_to)\s*:/g,
    severity: 'critical',
    cweId: 'CWE-284',
    description: 'Setting RekeyTo or CloseRemainderTo without strict authorization checks can drain or seize the contract account.',
    remediation: 'Ensure RekeyTo and CloseRemainderTo are explicitly set to Global.zero_address() unless authorized by admin multisig.',
  },
];

export function scanPatterns(code: string, language?: AuditLanguage): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const lines = code.split('\n');

  for (const rule of PATTERN_RULES) {
    if (rule.languages && language && !rule.languages.includes(language)) {
      continue;
    }

    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];
      rule.pattern.lastIndex = 0;

      if (rule.pattern.test(lineContent)) {
        findings.push({
          id: `${rule.id}-${i + 1}`,
          category: 'dangerous-pattern',
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          line: i + 1,
          lineEnd: i + 1,
          snippet: lineContent.trim(),
          remediation: rule.remediation,
          cweId: rule.cweId,
          confidence: 'high',
        });
      }
    }
  }

  return findings;
}
