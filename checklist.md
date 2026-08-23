# ADSEC - Master Checklist & Progress Tracker

> **Project:** ADSEC (Autonomous Decentralized Security Audit Node)  
> **Framework:** Hono Backend + React (Vite) Frontend on Algorand TestNet via GoPlausible Facilitator  
> **Architecture:** Paid Backend Engine (`x402-demo-server`) + Payment Flow Playground (`X402-Usecase`)  
> **Goal:** 100/100 points on Technical Judging Criteria (Live x402 on TestNet, GoPlausible facilitator, OSV.dev CVE + LLM Diff Engine, React Playground + Receipts Ledger).

---

## 1. Summary Progress

```mermaid
pie title Project Completion Status
    "Phase 1: Wallets & Infrastructure (Done)" : 25
    "Phase 2: Security Audit Engine (Done)" : 35
    "Phase 3: React Playground (Done)" : 20
    "Phase 4: Deploy & Verify (Remaining)" : 20
```

- [x] **Phase 1: Environment & Wallet Infrastructure** (Completed)
- [x] **Phase 2: Core ADSEC Security Engine (Backend)** (Completed)
- [x] **Phase 3: Interactive React Playground & Live On-Chain Integration** (Completed)
- [ ] **Phase 4: Cloud Deployment, Bazaar Verification & Pitch Prep** (Remaining)

---

## 2. Completed Milestones

### Phase 1: Environment & Wallet Infrastructure
- [x] Node.js LTS (v18+) and npm environment verified.
- [x] Official `x402-Project` template structure integrated into workspace.
- [x] Root `.gitignore` configured to protect all `.env` files, build directories, and keys.
- [x] Created two Algorand TestNet accounts on Lora (Payer for Agent, Receiver for ADSEC Server).
- [x] Funded both accounts with TestNet ALGO via Lora dispenser.
- [x] Opted both accounts into TestNet USDC (ASA `10458941`).
- [x] Funded Payer account with TestNet USDC via Circle faucet.
- [x] Configured `.env` in `x402-demo-server` and `.env.local` in `X402-Usecase`.

### Phase 2: Core ADSEC Security Engine (Backend)
- [x] Defined TypeScript data contracts (`engine/types.ts`).
- [x] Built weighted 0-100 Security Health Score calculator (`engine/scoring.ts`).
- [x] Built regex secret scanner for AWS, OpenAI, GitHub PATs, JWTs, and private keys (`engine/tier1/secrets.ts`).
- [x] Built dangerous syntax analyzer for SQLi, `eval()`, `pickle.loads()`, and `os.system()` (`engine/tier1/patterns.ts`).
- [x] Built supply-chain package typosquatting checker using Levenshtein distance (`engine/tier1/typosquat.ts`).
- [x] Integrated live public OSV.dev CVE database lookup with line-level caller correlation (`engine/tier1/osv.ts`).
- [x] Built automated unified Git diff patch generator (`engine/tier2/diff-generator.ts`).
- [x] Built LLM semantic review wrapper with fallback chain (`engine/tier2/llm.ts`).
- [x] Created unified audit orchestrator pipeline (`engine/index.ts`).
- [x] Registered `POST /adsec/scan`, `POST /adsec/remediate`, `POST /adsec/attest`, and `POST /adsec/audit` in `endpoints.config.ts`.
- [x] Created Hono endpoint handlers in `handlers/adsec-audit.ts` and wired into `index.ts`.
- [x] Built and verified Terminal Agent CLI (`scripts/agent-audit.ts`) with live multi-file support.
- [x] Built Dynamic Bazaar Discovery CLI (`scripts/agent-discover-and-audit.ts`).
- [x] Built 100% Live On-Chain Agent CLI (`scripts/agent-live-onchain.ts`).

### Phase 3: Interactive React Playground & Live On-Chain Integration
- [x] **3.1 API Client Utility (`src/utils/adsecApi.ts`)**: Built x402-enabled fetch wrapper linked to Algorand wallet signer for all 4 endpoints.
- [x] **3.2 Payment Flow Playground (`src/components/AdsecPlayground.tsx`)**: Built UI with 4 endpoint modes, vulnerability presets (Python SQLi, Supply Chain, PyTeAL Opt-In, JS XSS), 3-step live payment status card, score badge, findings list, unified Git diff viewer, and on-chain attestation receipt.
- [x] **3.3 Main App Navigation (`src/AppWithTabs.tsx` & `src/AdsecHome.tsx`)**: Configured ADSEC Security Node as the primary default active tab in the web application.
- [x] **3.4 Production Build Verification**: Verified clean build via TypeScript and Vite (`npx vite build` passing in 6.9s).

---

## 3. Remaining Tasks

### Phase 4: Cloud Deployment, Bazaar Verification & Pitch Prep

See step-by-step setup in [**`HOSTING_GUIDE.md`**](./HOSTING_GUIDE.md):
- [x] **4.1 Separate Backend & Frontend CI/CD Workflows (`.github/workflows/deploy-backend.yml` & `deploy-frontend.yml`)**: GitHub Actions pipelines for isolated testing and manual "Run action" cloud deployment.
- [ ] **4.2 Render Backend Deployment**: Deploy `x402-demo-server` to Render (free tier) and set environment variables (`AVM_ADDRESS`, `GROQ_API_KEY`, etc.).
- [ ] **4.3 Frontend Deployment**: Deploy `X402-Usecase` to Render Static Site / Vercel with `VITE_API_BASE_URL` pointing to live Render backend URL.
- [ ] **4.4 Keep-Alive Ping**: Setup free ping on `cron-job.org` hitting `/health` every 10 minutes to prevent cold starts during demo.
- [ ] **4.5 Bazaar Discovery Check**: Query GoPlausible discovery registry to verify public indexing of our live domain.
- [ ] **4.6 Demo Backup & Pitch Prep**: Record a 60-second backup video clip of the payment and audit flow for presentation day.

---

## 4. High-Impact Feature Expansions (Roadmap)

See detailed specs in [**`features.md`**](./features.md):
- [ ] **GitHub Repository Auditing (`repoUrl`)**: Ingest public repositories via GitHub REST API without git cloning.
- [ ] **Directory Auto-Discovery & Globbing**: CLI pattern matching (`src/**/*.py`) with automatic `.gitignore` compliance.
- [ ] **Algorand Smart Contract Specialist**: PyTeAL / AlgoKit AST rules for missing ASA opt-ins and unchecked inner transactions (`itxn`).
- [ ] **AI Agent Prompt Firewall**: Detect indirect prompt injections and outbound data exfiltration attempts.
- [ ] **On-Chain Audit Attestation**: Write SHA-256 code hash and audit score to Algorand transaction note field (`tx_note`).
- [ ] **PR Diff Mode**: Scan only changed lines in GitHub Actions for sub-200ms CI/CD gating.
