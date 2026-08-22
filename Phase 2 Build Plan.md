# ADSEC — Phase 2 Build Plan (Security Audit Engine)

> **Objective:** Build the complete core security analysis engine (Tier 1 deterministic + Tier 2 LLM semantic) inside `x402-Project/x402-demo-server/engine/`, designed to plug seamlessly into the Hono x402 router.

---

## 🤝 The Integration Contract (Backend Architecture)

All security analysis logic is completely modular and isolated inside `x402-Project/x402-demo-server/engine/`.

```
┌────────────────────────────────────────────────────────┐
│ Hono Server (x402-Project/x402-demo-server/index.ts)   │
│ Payment Middleware: paymentMiddleware(paymentConfig)   │
│                                                        │
│   POST /adsec/audit                                    │
│        │                                               │
│        ▼ (Payment verified by GoPlausible Facilitator) │
├────────────────────────────────────────────────────────┤
│ ADSEC Audit Handler: handlers/adsec-audit.ts           │
│        │                                               │
│        ▼ Calls `runAudit(payload)`                     │
├────────────────────────────────────────────────────────┤
│ ADSEC Security Engine: engine/index.ts                 │
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
│ Hono returns HTTP 200 JSON with report + Tx receipt    │
└────────────────────────────────────────────────────────┘
```

### The Exact TypeScript Interface Contract (`engine/types.ts`)

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
    txId?: string;               // Populated on settlement
    network?: string;
    timestamp?: string;
  };
}
```

---

## 📁 Directory Structure inside `x402-demo-server/`

```text
x402-Project/x402-demo-server/
├── index.ts                   # Main Hono server & route registration
├── endpoints.config.ts        # Payment configuration & Bazaar discovery metadata
├── handlers/
│   └── adsec-audit.ts         # Endpoint handler (executes `runAudit`)
└── engine/
    ├── types.ts               # Integration interfaces & contracts
    ├── index.ts               # Main orchestrator (`runAudit`)
    ├── scoring.ts             # Score calculation (0-100) & severity ranking
    ├── tier1/
    │   ├── secrets.ts         # Regex secret scanner (API keys, private keys, JWTs)
    │   ├── patterns.ts        # Dangerous patterns (eval, SQLi, ReDoS, unsafe deserialization)
    │   ├── typosquat.ts       # Package name Levenshtein distance check
    │   ├── outdated.ts        # PyPI / npm registry versions check
    │   └── osv.ts             # OSV.dev CVE query + line-level caller correlation
    └── tier2/
        ├── llm.ts             # LLM provider wrapper (OpenAI / Gemini API)
        ├── semantic.ts        # Logic flaw & auth vulnerability analyzer
        └── diff-generator.ts  # Unified git diff generator for fixes
```

---

## 📋 Granular Phase 2 Execution Plan

### Step 1: Core Engine & Types
1. Create `engine/types.ts` with strict TypeScript types.
2. Create `engine/scoring.ts` to compute the 0–100 security score:
   - Base score: 100.
   - Deductions: Critical (-25), High (-15), Medium (-7), Low (-2).
   - Minimum score: 0.

### Step 2: Tier 1 Scanners
1. **`engine/tier1/secrets.ts`**:
   - AWS Key ID (`AKIA[0-9A-Z]{16}`) & Secret Key regex.
   - OpenAI Key (`sk-[a-zA-Z0-9_-]{32,}`).
   - GitHub Token (`ghp_[a-zA-Z0-9]{36}`, `github_pat_`).
   - Private Key blocks (`-----BEGIN ... PRIVATE KEY-----`).
   - JWT tokens (`eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?...`).
   - Line numbers & masked preview (e.g. `sk-***4f2a`).

2. **`engine/tier1/patterns.ts`**:
   - Python: `eval`, `exec`, `pickle.loads`, `subprocess(shell=True)`, SQL string concatenation.
   - JS/TS: `eval`, `new Function`, `dangerouslySetInnerHTML`, ReDoS, prototype pollution.
   - Solidity: `tx.origin`, reentrancy risks.

3. **`engine/tier1/typosquat.ts`**:
   - Levenshtein edit distance check against top 500 popular packages (e.g., catching `reqeusts`, `lodas-h`, `axois`).

4. **`engine/tier1/osv.ts`**:
   - Calls OSV.dev API (`https://api.osv.dev/v1/query`).
   - Correlates CVE-flagged package/symbols to exact code lines.

### Step 3: Tier 2 AI Logic Review & Git Diff Generator
1. **`engine/tier2/llm.ts`**:
   - Call Gemini / OpenAI API with timeout safety (max 5s).
   - Strict JSON response formatting.
2. **`engine/tier2/diff-generator.ts`**:
   - Generates clean, actionable unified diff patch strings (`--- a/file\n+++ b/file\n...`).

### Step 4: Endpoint & Discovery Registration
1. **`x402-demo-server/endpoints.config.ts`**:
   - Register `POST /adsec/audit` with price `$0.01` (or `$0.05`) in USDC.
   - Add Bazaar discovery extension with input/output schema.
2. **`x402-demo-server/handlers/adsec-audit.ts`**:
   - Implement Hono handler calling `runAudit`.
3. **`x402-demo-server/index.ts`**:
   - Register `app.post('/adsec/audit', handleAdsecAuditRequest);`.
