# ADSEC — Master Checklist & Progress Tracker

> **Project:** ADSEC (Autonomous Decentralized Security Audit Node)  
> **Framework:** Hono + React (Vite) on Algorand TestNet via GoPlausible Facilitator  
> **Architecture:** Paid Backend Engine (`x402-demo-server`) + Payment Flow Playground (`X402-Usecase`)  
> **Goal:** 100/100 points on Technical Judging Criteria (Live x402 on TestNet, GoPlausible facilitator, OSV.dev CVE + LLM Diff Engine, React Playground + Receipts Ledger).

---

## 📊 Overall Progress

- [x] **Phase 1: Environment & Wallet Infrastructure** (Completed)
- [x] **Phase 2: Core ADSEC Security Engine (Backend)** (Completed)
- [ ] **Phase 3: Interactive Payment Playground & Receipts Ledger (Frontend)** (0/6 items completed)
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

## Phase 2: Core ADSEC Security Engine (Backend) ✅

Objective: *Build the multi-tier security analysis pipeline in `x402-Project/x402-demo-server/engine/` and wire it to Hono.*

### 2.1 Engine Types & Architecture
- [x] Define types in `x402-demo-server/engine/types.ts` (`AuditRequest`, `AuditResponse`, `AuditFinding`, `AuditDiffFix`)
- [x] Implement scoring algorithm in `x402-demo-server/engine/scoring.ts` (0-100 score calculation)
- [x] Implement orchestrator in `x402-demo-server/engine/index.ts` (`runAudit`)

### 2.2 Tier 1: Deterministic Security Engine
- [x] **Secret Scanner (`engine/tier1/secrets.ts`)**:
  - [x] Regex for AWS/GCP keys, OpenAI keys, GitHub PATs, JWTs, generic private keys
  - [x] Line numbers + masked preview (e.g. `sk-***4f2a`)
- [x] **Dangerous Pattern Scanner (`engine/tier1/patterns.ts`)**:
  - [x] Python: `eval()`, `exec()`, `pickle.loads()`, `subprocess(shell=True)`, SQL concatenation
  - [x] JavaScript/TypeScript: `eval()`, `dangerouslySetInnerHTML`, ReDoS, prototype pollution
- [x] **Typosquatting Checker (`engine/tier1/typosquat.ts`)**:
  - [x] Levenshtein distance check against top 500 popular npm/PyPI packages
- [x] **OSV.dev CVE Query & Line Correlation (`engine/tier1/osv.ts`)**:
  - [x] Query OSV.dev public vulnerability API with ecosystem and package versions
  - [x] Correlate vulnerable symbols directly to code lines calling them

### 2.3 Tier 2: AI Semantic Logic Review & Diff Fixes
- [x] LLM provider client in `engine/tier2/llm.ts` (Gemini / OpenAI API)
- [x] Unified Git diff/patch generator (`engine/tier2/diff-generator.ts`)

### 2.4 Hono Route & x402 Registration
- [x] Register `POST /adsec/audit` in `x402-demo-server/endpoints.config.ts` with Bazaar discovery extension
- [x] Implement `handleAdsecAuditRequest` in `x402-demo-server/handlers/adsec-audit.ts`
- [x] Connect handler in `x402-demo-server/index.ts`
- [x] Terminal Agent CLI test verified: `npx tsx scripts/agent-audit.ts` (627ms execution)

---

## Phase 3: Interactive Payment Playground & Receipts Ledger (Frontend)

Objective: *Build the React UI showcasing the live 3-step x402 payment flow and on-chain receipts ledger.*

### 3.1 Payment Flow Playground (`AdsecPlayground.tsx`)
- [ ] Interactive code input with preloaded presets (*"Python SQLi"*, *"Leaked AWS Key"*, *"CVE Vulnerability"*)
- [ ] Tier selection toggle (Tier 1 vs Tier 2) with price in USDC
- [ ] "Run Live x402 Security Audit" action button
- [ ] **Live 3-Step Payment Flow Card (matching official kit visual)**:
  - [ ] 🟡 **Step 1:** `402 Payment Required` (Price, Network, PayTo Address)
  - [ ] 🔵 **Step 2:** `Client signs payment` (Algorand TestNet payer address)
  - [ ] 🟢 **Step 3:** `200 OK - Paid response` (Findings + Git Diff + Tx Hash)
- [ ] Visual Findings list with severity tags (Critical, High, Medium, Low)
- [ ] Actionable Git Diff patch viewer with copy button

### 3.2 Receipts Ledger (`ReceiptsLedger.tsx`)
- [ ] Full history table of all paid security audit requests
- [ ] Shows Timestamp, Service Tier, Fee Paid, Status, and clickable **Tx Hash link directly to Lora Explorer**

### 3.3 Agent CLI Script (`scripts/agent-audit.ts`)
- [ ] Standalone terminal script demonstrating automated agent flow: Unpaid ➔ 402 ➔ Auto-sign ➔ 200 OK + Apply Patch

---

## Phase 4: Deployment & Final Judging Verification

Objective: *Deploy live, verify Bazaar discovery, and prepare 3-minute pitch.*

### 4.1 Deployment (Render / Railway)
- [ ] Deploy `x402-demo-server` to Render (Free Web Service)
- [ ] Configure environment variables (`AVM_ADDRESS`, `FACILITATOR_URL`, `PORT`, `GEMINI_API_KEY`)
- [ ] Deploy frontend to Vercel / Netlify
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
