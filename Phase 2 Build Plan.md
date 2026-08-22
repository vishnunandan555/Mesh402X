# ADSEC — Phase 2 Build Plan (Security Audit Engine)

> **Objective:** Build the complete core security analysis engine (Tier 1 deterministic + Tier 2 LLM semantic) in complete modular isolation, designed to plug seamlessly into the Phase 1 x402 payment router (`POST /api/adsec/audit`).

---

## 🤝 The Integration Contract (Phase 1 ⇄ Phase 2 Boundary)

To ensure you (Phase 2) and your friend (Phase 1) can code in parallel without blocking each other or causing merge conflicts, **all Phase 2 logic lives inside `src/engine/`** behind a single clean TypeScript interface.

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: x402 Transport Layer (Friend)                │
│ Express Router ➔ x402 Middleware (402/Paid Gate)       │
│                                                        │
│   POST /api/adsec/audit                                │
│        │                                               │
│        ▼ (Passes validated payload)                    │
├────────────────────────────────────────────────────────┤
│ Phase 2: ADSEC Audit Engine (You)                      │
│                                                        │
│   src/engine/index.ts: `runAudit(payload)`             │
│        ├── Tier 1: Deterministic Engine (Fast/Free)   │
│        │   ├── Secret / Credential Regex Scanner       │
│        │   ├── Dangerous Syntax / Pattern Analyzer     │
│        │   ├── Typosquat Dependency Checker            │
│        │   ├── Outdated Package Registry Check         │
│        │   └── OSV.dev CVE + Line-Level Correlation    │
│        │                                               │
│        └── Tier 2: AI Semantic Review (Premium)        │
│            ├── LLM Logic / Auth Vulnerability Review   │
│            └── Unified Git Diff / Patch Generator      │
│                                                        │
│        ▼ (Returns unified structured JSON)             │
├────────────────────────────────────────────────────────┤
│ Phase 1: Injects on-chain txId & returns HTTP 200      │
└────────────────────────────────────────────────────────┘
```

### The Exact TypeScript Interface Contract (`src/engine/types.ts`)

```typescript
export interface AuditRequest {
  code: string;                  // Target source code snippet
  language: 'javascript' | 'typescript' | 'python' | 'solidity' | 'json' | 'text';
  tier: 'tier1' | 'tier2';       // tier1 = deterministic, tier2 = deterministic + LLM
  filename?: string;             // Optional filename (e.g. "auth.py", "server.ts")
  manifestContent?: string;      // Optional package.json or requirements.txt
}

export interface AuditFinding {
  id: string;
  category: 'secret' | 'vulnerability' | 'dangerous-pattern' | 'typosquat' | 'outdated-dep' | 'semantic-logic';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line?: number;
  lineEnd?: number;
  snippet?: string;
  remediation: string;
  cveId?: string;
  cweId?: string;
  packageName?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditDiffFix {
  findingId: string;
  filePath?: string;
  diff: string;                 // Standard unified diff format
  explanation: string;
}

export interface AuditResponse {
  success: boolean;
  tier: 'tier1' | 'tier2';
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    score: number;               // Security Health Score (0 - 100)
    durationMs: number;
  };
  findings: AuditFinding[];
  fixes?: AuditDiffFix[];        // Populated in Tier 2
  receipt?: {
    txId?: string;               // Populated by Phase 1 on settlement
    network?: string;
    timestamp?: string;
  };
}
```

---

## 📁 Phase 2 Directory Structure

```text
src/engine/
├── types.ts                   # Integration interfaces & contracts
├── index.ts                   # Main orchestrator (`runAudit`)
├── scoring.ts                 # Score calculation (0-100) & severity ranking
├── tier1/
│   ├── secrets.ts             # Regex secret scanner (API keys, private keys, JWTs)
│   ├── patterns.ts            # Dangerous patterns (eval, SQLi, ReDoS, unsafe deserialization)
│   ├── typosquat.ts           # Package name Levenshtein distance check
│   ├── outdated.ts            # PyPI / npm registry versions check
│   └── osv.ts                 # OSV.dev CVE query + line-level caller correlation
├── tier2/
│   ├── llm.ts                 # LLM provider wrapper (OpenAI / Gemini / Anthropic)
│   ├── semantic.ts            # Logic flaw & auth vulnerability analyzer
│   └── diff-generator.ts      # Unified git diff generator for fixes
└── test-fixtures/             # Sample vulnerable code snippets for standalone testing
    ├── vulnerable-python.py
    ├── vulnerable-js.js
    └── package.json
```

---

## 📋 Comprehensive Phase 2 Checklist

### 1. Engine Core & Interfaces
- [ ] Create `src/engine/types.ts` with strict input/output interfaces.
- [ ] Create `src/engine/scoring.ts` to compute score (100 minus weighted penalties: Critical -25, High -15, Medium -7, Low -2).
- [ ] Create `src/engine/index.ts` orchestrator to run rules in parallel with `Promise.allSettled()`.

### 2. Tier 1: Deterministic Engine (Zero LLM Cost, Instant Execution)

#### 2.1 Secret & Credential Regex Scanner (`src/engine/tier1/secrets.ts`)
- [ ] AWS Access Key ID (`AKIA[0-9A-Z]{16}`) and Secret Key patterns.
- [ ] OpenAI API Keys (`sk-[a-zA-Z0-9_-]{32,}`).
- [ ] GitHub Personal Access Tokens (`ghp_[a-zA-Z0-9]{36}`, `github_pat_`).
- [ ] Generic Private Keys (`-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----`).
- [ ] Hardcoded JWT tokens (`eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*`).
- [ ] Hardcoded password/secret variable assignments (`password\s*=\s*['"][^'"]+['"]`).
- [ ] Calculate line numbers and mask detected secrets in previews (e.g. `sk-proj-***4a2b`).

#### 2.2 Dangerous Syntax & Pattern Analyzer (`src/engine/tier1/patterns.ts`)
- [ ] **Python checks**:
  - [ ] `eval()` / `exec()` / `compile()` calls.
  - [ ] `pickle.loads()` / `yaml.load(Loader=Loader)` (unsafe deserialization).
  - [ ] `subprocess.Popen(..., shell=True)` / `os.system()` (command injection).
  - [ ] SQL string formatting (`f"SELECT * FROM users WHERE id = {user_id}"`).
  - [ ] Weak hashing: `hashlib.md5()`, `hashlib.sha1()`.
- [ ] **JavaScript / TypeScript checks**:
  - [ ] `eval()` / `new Function()` execution.
  - [ ] `child_process.exec()` with concatenated user input.
  - [ ] `dangerouslySetInnerHTML` in React / JSX.
  - [ ] Prototype pollution patterns (`__proto__`, `constructor.prototype`).
  - [ ] Insecure Randomness: `Math.random()` used in security contexts.
- [ ] **Solidity checks** (Bonus):
  - [ ] `tx.origin` authorization checks.
  - [ ] Unchecked `.call{value: ...}("")` reentrancy hazards.

#### 2.3 Dependency Typosquatting Checker (`src/engine/tier1/typosquat.ts`)
- [ ] Compile dictionary of top 500 popular packages (`express`, `lodash`, `requests`, `axios`, `react`, `flask`, `urllib3`, etc.).
- [ ] Parse `import` / `require` / manifest dependencies from incoming code.
- [ ] Calculate Levenshtein distance: flag any package with distance 1 or 2 from a popular package (e.g. `reqeusts` vs `requests`, `lodas-h` vs `lodash`).

#### 2.4 Outdated & Abandoned Dependency Check (`src/engine/tier1/outdated.ts`)
- [ ] For npm: Query `https://registry.npmjs.org/<pkg>/latest` for latest version.
- [ ] For PyPI: Query `https://pypi.org/pypi/<pkg>/json` for latest version.
- [ ] Flag if the package is >2 major versions behind or has not been updated in >3 years.

#### 2.5 OSV.dev CVE Query & Line-Level Correlation (`src/engine/tier1/osv.ts`)
- [ ] Query free public API: `POST https://api.osv.dev/v1/query` with `{ package: { name, ecosystem }, version }`.
- [ ] Extract CVE ID, GHSA ID, CVSS score, affected version range, and advisory summary.
- [ ] **Line-Level Correlation (Key Differentiator)**:
  - [ ] Parse the code to check if vulnerable functions / symbols mentioned in the CVE are actually called.
  - [ ] Mark finding as `confidence: high` with specific line numbers if the call site is detected in code.

---

### 3. Tier 2: LLM-Powered Semantic Engine & Diff Generator

#### 3.1 LLM Provider Wrapper (`src/engine/tier2/llm.ts`)
- [ ] Support OpenAI / Gemini / Anthropic via unified wrapper with timeout (max 6s).
- [ ] Strict JSON output mode (`response_format: { type: "json_object" }`).
- [ ] Graceful fallback: If LLM call fails or times out, return Tier 1 results without crashing.

#### 3.2 Semantic Logic Review (`src/engine/tier2/semantic.ts`)
- [ ] Prompt engineered specifically for:
  - [ ] Broken Object Level Authorization (BOLA / IDOR).
  - [ ] Missing authentication checks in API routes.
  - [ ] Business logic race conditions and state desynchronization.
  - [ ] Insecure direct object references.

#### 3.3 Unified Diff / Patch Generator (`src/engine/tier2/diff-generator.ts`)
- [ ] Produce actionable unified diff format (`--- a/file.ts\n+++ b/file.ts\n@@ ... @@`).
- [ ] Ready for autonomous AI agents to apply directly via `git apply` or automated PR.

---

### 4. Standalone Verification & Unit Tests
- [ ] Create test runner `pnpm test:engine` that tests Tier 1 & Tier 2 locally without needing Algorand/x402 running.
- [ ] Test fixtures with 100% detection rate on:
  - [ ] Hardcoded AWS key ➔ Caught by Secret Scanner.
  - [ ] `eval(userInput)` ➔ Caught by Pattern Scanner.
  - [ ] `import reqeusts` ➔ Caught by Typosquatting Checker.
  - [ ] Vulnerable package version ➔ Caught by OSV.dev lookup.
  - [ ] Missing auth check ➔ Caught by Tier 2 LLM with Git Diff fix.

---

## 🚀 How to Merge Seamlessly with Phase 1

When your friend has Phase 1 working (`pnpm client:paid` returns 200 OK):

1. Your friend imports your engine in their route:
   ```typescript
   import { runAudit } from '../engine';

   app.post('/api/adsec/audit', x402PaymentGate(tierPrice), async (req, res) => {
     const auditResult = await runAudit(req.body);
     
     // Inject on-chain transaction receipt from x402 context
     auditResult.receipt = {
       txId: req.x402Payment?.txId,
       network: process.env.ALGORAND_NETWORK || 'testnet',
       timestamp: new Date().toISOString()
     };

     res.json(auditResult);
   });
   ```
2. Run `pnpm client:paid` with real code payload ➔ Real on-chain paid security audit delivered!
