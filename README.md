# ADSEC - Autonomous Decentralized Security Audit Node

> **x402 Pay-Per-Call Code Security Auditing for AI Agents on Algorand TestNet**  
> Built for the **x402 Global Build Sprint**

[![Network](https://img.shields.io/badge/Network-Algorand%20TestNet-blue)](https://lora.algokit.io/testnet)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-green)](https://x402.money)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible-orange)](https://facilitator.goplausible.xyz)
[![Asset](https://img.shields.io/badge/Currency-TestNet%20USDC%20(ASA%2010458941)-blueviolet)](https://lora.algokit.io/testnet/asset/10458941)
[![Backend](https://img.shields.io/badge/Backend-Hono%20%2B%20TypeScript-yellow)](https://hono.dev)

---

## 1. What is ADSEC?

**ADSEC** is an on-demand, pay-per-call **Code Security Audit API and Agent CLI** running as an x402 node on Algorand TestNet.

When autonomous AI coding agents generate code, write smart contracts, or prepare pull requests, they cannot safely deploy to production or mainnet without a verified security audit. ADSEC gives agents an automated, pay-per-call security auditor funded via micro-payments in **TestNet USDC (ASA 10458941)** through the **GoPlausible Facilitator**.

---

## 2. Key Capabilities & The 3 Green Cards Pipeline

ADSEC implements a modular 3-stage security pipeline where each stage is a standalone x402 payment endpoint:

1. **Card 1: Pre-Flight Deterministic Scanner (`POST /adsec/scan` - $0.01 USDC)**
   - **Secret & Credential Scanner:** Detects exposed AWS/GCP keys, OpenAI tokens, GitHub PATs, JWTs, and private keys.
   - **Dangerous Pattern Detector:** Detects `eval()`, SQL string concatenations, unsafe deserialization (`pickle`, `yaml`), and command execution.
   - **Typosquatting Package Checker:** Levenshtein edit-distance checks against top 500 npm/PyPI packages.
   - **OSV.dev CVE Database Correlation:** Queries real vulnerability databases and correlates CVEs directly to calling code lines.

2. **Card 2: Auto-Remediation Patch Generator (`POST /adsec/remediate` - $0.03 USDC)**
   - **Language-Aware Unified Diff Generator:** Generates actionable unified Git diff patches (`--- a/ +++ b/`) formatted for `git apply`.
   - **Multi-Provider Semantic Fallback:** Groq (Llama-3.3-70B in <300ms) -> Google Gemini 1.5 Flash -> OpenAI GPT-4o-mini -> Deterministic rules.

3. **Card 3: Cryptographic On-Chain Attestation (`POST /adsec/attest` - $0.01 USDC)**
   - Calculates SHA-256 code hash and logs cryptographic Proof-of-Audit certificates directly to Algorand TestNet transaction notes (`tx_note`).

4. **Unified Suite (`POST /adsec/audit` - $0.05 USDC)**
   - Full all-in-one execution of scanning, diff patch generation, and on-chain attestation in a single call.

---

## 3. Architecture & Machine-to-Machine Workflow

```
┌────────────────────────────────────────────────────────┐
│             Autonomous AI Agent / Terminal CLI         │
│   (npm run live / npm run discover)                    │
└───────────────────────────┬────────────────────────────┘
                            │ 1. POST /adsec/audit (Unpaid)
                            ▼
┌────────────────────────────────────────────────────────┐
│             ADSEC Hono Resource Server                 │
│                 (x402-demo-server)                     │
│   - Enforces x402 payment gate (Price: $0.01 - $0.05)  │
└───────────────────────────┬────────────────────────────┘
                            │ 2. Returns HTTP 402 Payment Required
                            ▼
┌────────────────────────────────────────────────────────┐
│             GoPlausible Facilitator                    │
│   - Agent signs TestNet USDC transaction               │
│   - Facilitator broadcasts & verifies on Algorand      │
└───────────────────────────┬────────────────────────────┘
                            │ 3. Retries POST with Payment-Signature
                            ▼
┌────────────────────────────────────────────────────────┐
│               ADSEC Security Audit Engine              │
│   ├── Tier 1: Deterministic Engine (Secrets, CVEs)     │
│   │   ├── Regex Secrets & Tokens Scanner               │
│   │   ├── Dangerous Syntax & AST Pattern Matcher       │
│   │   ├── Typosquatting Package Name Analyzer          │
│   │   └── OSV.dev CVE Query + Line Correlation         │
│   └── Tier 2: AI Logic Review & Git Diff Generator     │
│       ├── Auth Bypass & Logic Flaw Review              │
│       └── Unified Git Patch Generator (--- a/ +++ b/)  │
└───────────────────────────┬────────────────────────────┘
                            │ 4. HTTP 200 OK (Findings + Diff + TxID)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Agent Auto-Applies Git Patch               │
│   - Code is secured and ready for production           │
└────────────────────────────────────────────────────────┘
```

---

## 4. Quick Start & CLI Usage

### Prerequisites
- Node.js v18+ and npm

### Run Commands from Project Root:
```bash
# 1. Run Dynamic Bazaar Discovery & Hire Demo
npm run discover

# 2. Run Live On-Chain Agent against Hosted Backend
npm run live https://adsec-backend.onrender.com

# 3. Run Multi-File Security Audit
npm run audit path/to/file1.py path/to/file2.js

# 4. Start Local Backend Server
npm run dev:backend

# 5. Start Local React Playground
npm run dev:frontend
```

---

## 5. Cloud Hosting & CI/CD Setup

- **Backend:** Hosted on Render as a long-running Node.js Web Service (`x402-demo-server`).
- **Frontend:** Hosted on Render / Vercel as a Static Site (`X402-Usecase`).
- **CI/CD:** 2 separate manual GitHub Actions workflows:
  - `.github/workflows/deploy-backend.yml` (Manual trigger for Render backend)
  - `.github/workflows/deploy-frontend.yml` (Manual trigger for Frontend)

See [**`HOSTING_GUIDE.md`**](./HOSTING_GUIDE.md) for full deployment instructions.

---

## 6. Repository Organization

```text
Mesh402X/
├── package.json                        # Root workspace scripts (discover, live, audit, dev)
├── checklist.md                        # Project milestone tracking
├── features.md                         # Detailed feature specs & ROI analysis
├── HOSTING_GUIDE.md                    # Cloud deployment guide for Render & Vercel
├── README.md                           # Main documentation
│
└── x402-Project/
    ├── x402-demo-server/               # Backend Hono Resource Server
    │   ├── index.ts                    # Hono server entry, CORS & x402 middleware
    │   ├── endpoints.config.ts         # 3 Green Card routes & Bazaar discovery metadata
    │   ├── handlers/adsec-audit.ts     # Endpoint handlers for scan, remediate, attest, audit
    │   ├── engine/                     # Security audit engine (regex, CVEs, typosquat, diffs)
    │   └── scripts/                    # Agent CLI demonstration scripts
    │
    └── X402-Usecase/                   # React Frontend
        └── projects/X402-Usecase/
            ├── src/components/AdsecPlayground.tsx # Interactive x402 audit playground
            ├── src/AdsecHome.tsx                  # ADSEC view with wallet connector
            └── src/AppWithTabs.tsx                # App navigation with ADSEC as default tab
```
