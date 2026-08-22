# ADSEC — Master Checklist & Progress Tracker

> **Project:** ADSEC (Autonomous Decentralized Security Audit Node)  
> **Framework:** Hono + React (Vite) on Algorand TestNet via GoPlausible Facilitator  
> **Reference Repo:** `x402-Project`  
> **Goal:** 100/100 points on the Technical Judging Criteria (Live x402 on TestNet, GoPlausible facilitator, OSV.dev CVE + LLM Diff Engine, React Dashboard + Agent API).

---

## 📊 Overall Progress

- [x] **Phase 1: Environment & Wallet Infrastructure** (Completed)
- [ ] **Phase 2: Core ADSEC Security Engine (Backend)** (0/8 items completed)
- [ ] **Phase 3: Interactive Frontend & Agent Verification** (0/6 items completed)
- [ ] **Phase 4: Deployment & Final Judging Verification** (0/5 items completed)

---

## Phase 1: Environment & Wallet Infrastructure ✅

Objective: *Set up Algorand TestNet accounts, funding, and verify the x402 starter repo.*

### 1.1 Dev Environment & Repo Setup
- [x] Verify Node.js LTS (v18+) is installed (`node -v`)
- [x] Verify `npm` / `pnpm` is available
- [x] Official `x402-Project` structure integrated into workspace
- [x] Ensure root `.gitignore` protects all `.env` files and secrets
- [x] Initial commit pushed to GitHub repository

### 1.2 Algorand TestNet Wallet Setup
- [x] Open [Lora TestNet Explorer](https://lora.algokit.io/testnet)
- [x] **Create Payer Account (AI Agent simulation)**:
  - [x] Generate account and securely store 25-word mnemonic
  - [x] Copy public address
- [x] **Create Receiver Account (ADSEC Server payout address)**:
  - [x] Generate account and copy public address

### 1.3 Funding & Asset Opt-in (Critical)
- [x] Fund Payer account with TestNet ALGO via [Lora Faucet](https://lora.algokit.io/testnet/fund)
- [x] Fund Receiver account with TestNet ALGO via [Lora Faucet](https://lora.algokit.io/testnet/fund)
- [x] **Opt-in Payer account to TestNet USDC (ASA 10458941)** on Lora
- [x] **Opt-in Receiver account to TestNet USDC (ASA 10458941)** on Lora
- [x] Fund Payer account with TestNet USDC via [Circle Faucet](https://faucet.circle.com/)
- [x] Confirm nonzero ALGO and USDC balances for both accounts on Lora

### 1.4 Server & Client Configuration
- [x] Create `x402-Project/x402-demo-server/.env`:
  ```env
  AVM_ADDRESS=<Receiver Address>
  FACILITATOR_URL=https://facilitator.goplausible.xyz
  PORT=4021
  ```
- [x] Create `x402-Project/X402-Usecase/projects/X402-Usecase/.env.local`:
  ```env
  VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
  VITE_ALGOD_NETWORK=testnet
  VITE_API_BASE_URL=http://localhost:4021
  VITE_FACILITATOR_URL=https://facilitator.goplausible.xyz
  ```

---

## Phase 2: Core ADSEC Security Engine (Backend)

Objective: *Build the multi-tier security analysis pipeline in `x402-Project/x402-demo-server/engine/` and wire it to Hono.*

### 2.1 Engine Types & Architecture
- [ ] Define types in `x402-demo-server/engine/types.ts` (`AuditRequest`, `AuditResponse`, `AuditFinding`, `AuditDiffFix`)
- [ ] Implement scoring algorithm in `x402-demo-server/engine/scoring.ts` (0-100 score calculation)
- [ ] Implement orchestrator in `x402-demo-server/engine/index.ts` (`runAudit`)

### 2.2 Tier 1: Deterministic Security Engine
- [ ] **Secret Scanner (`engine/tier1/secrets.ts`)**:
  - [ ] Regex for AWS/GCP keys, OpenAI keys, GitHub PATs, JWTs, generic private keys
  - [ ] Line numbers + masked preview
- [ ] **Dangerous Pattern Scanner (`engine/tier1/patterns.ts`)**:
  - [ ] Python: `eval()`, `exec()`, `pickle.loads()`, `subprocess(shell=True)`, SQL concatenation
  - [ ] JavaScript/TypeScript: `eval()`, `dangerouslySetInnerHTML`, ReDoS, prototype pollution
- [ ] **Typosquatting Checker (`engine/tier1/typosquat.ts`)**:
  - [ ] Levenshtein distance check against top 500 popular npm/PyPI packages
- [ ] **Outdated/Abandoned Package Check (`engine/tier1/outdated.ts`)**:
  - [ ] Query registry APIs for deprecated or severely outdated dependencies
- [ ] **OSV.dev CVE Query & Line Correlation (`engine/tier1/osv.ts`)**:
  - [ ] Query OSV.dev public vulnerability API
  - [ ] Correlate vulnerable symbols to exact calling code lines

### 2.3 Tier 2: AI Semantic Logic Review & Diff Fixes
- [ ] LLM provider client in `engine/tier2/llm.ts` (Gemini / OpenAI API)
- [ ] Semantic analysis for auth bypass & broken access control (`engine/tier2/semantic.ts`)
- [ ] Unified Git diff/patch generator (`engine/tier2/diff-generator.ts`)

### 2.4 Hono Route & x402 Registration
- [ ] Register `POST /adsec/audit` in `x402-demo-server/endpoints.config.ts` with Bazaar discovery extension
- [ ] Implement `handleAdsecAuditRequest` in `x402-demo-server/handlers/adsec-audit.ts`
- [ ] Connect handler in `x402-demo-server/index.ts`
- [ ] Standalone test: `curl -i http://localhost:4021/adsec/audit` returns `HTTP 402`

---

## Phase 3: Interactive Frontend & Agent Verification

Objective: *Build the React UI and standalone agent script for judges to test both web & CLI flows.*

### 3.1 React UI Component (`AdsecAudit.tsx`)
- [ ] Create `src/components/AdsecAudit.tsx` in frontend
- [ ] Code editor with pre-loaded vulnerability templates (Python SQLi, Leaked AWS Key, Typosquatted package)
- [ ] Tier selection toggle (Tier 1 vs Tier 2) with price display
- [ ] Pay & Audit button using `@x402-avm/fetch` wrapper
- [ ] Results panel:
  - [ ] Security Health Score gauge (0-100)
  - [ ] Severity badges (Critical, High, Medium, Low)
  - [ ] Code snippet markers with line numbers
  - [ ] Unified Diff viewer for Tier-2 fixes
  - [ ] **Verified on Algorand Badge** with direct link to Lora Explorer

### 3.2 Agent CLI Script
- [ ] Create standalone CLI script `x402-demo-server/scripts/agent-audit.ts`
- [ ] Demonstrates automated machine-to-machine flow: Unpaid ➔ 402 ➔ Auto-sign ➔ 200 OK + Git Diff

---

## Phase 4: Deployment & Final Judging Verification

Objective: *Deploy live, verify Bazaar discovery, and prepare 3-minute pitch.*

### 4.1 Deployment (Render / Railway)
- [ ] Deploy `x402-demo-server` to Render (Free Web Service)
- [ ] Configure environment variables (`AVM_ADDRESS`, `FACILITATOR_URL`, `PORT`)
- [ ] Deploy frontend to Vercel / Netlify (or serve statically)
- [ ] Setup keep-alive ping on `cron-job.org` for the live URL `/health`

### 4.2 On-Chain & Judging Verification
- [ ] Perform live transaction and copy Algorand TestNet TxID
- [ ] Verify Tx on [Lora Explorer](https://lora.algokit.io/testnet) shows USDC ASA `10458941` transfer
- [ ] Confirm Bazaar discovery registration via GoPlausible API:
  ```bash
  curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000" | grep "adsec"
  ```
- [ ] Record backup 60-second video of the complete flow
- [ ] Ready for final 3-minute judging presentation!
