# ADSEC — Project Master Checklist & Progress Tracker

> **Project:** ADSEC (Autonomous Decentralized Security Audit Service)  
> **Protocol / Network:** x402 on Algorand TestNet via GoPlausible Facilitator  
> **Goal:** Deploy a live, production-grade, pay-per-call code security audit endpoint with deterministic & LLM tiers and Bazaar discovery indexing.

---

## 📊 Summary Progress

- [ ] **Phase 1: Environment & Payment Rail Plumbing** (0/6 items completed)
- [ ] **Phase 2: ADSEC Audit Engine (Tier 1 & Tier 2)** (0/8 items completed)
- [ ] **Phase 3: Web UI, Deployment & Discovery** (0/7 items completed)

---

## Phase 1: Environment & Payment Rail Plumbing

Objective: *Prove the entire x402 payment rail end-to-end on Algorand TestNet before writing audit logic.*

### 1.1 Dev Environment & Repo Setup
- [x] Verify Node.js LTS (v18+) is installed (`node -v`)
- [x] Install `pnpm` package manager
- [x] Clone / initialize the `x402-commerce-template` into workspace
- [] Run `pnpm install` and verify `@x402-avm` packages are installed
- [x] Ensure `.env` and sensitive patterns are included in `.gitignore`

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
- [x] **Opt-in Payer account to TestNet USDC** on Lora
- [x] **Opt-in Receiver account to TestNet USDC** on Lora
- [x] Fund Payer account with TestNet USDC via [Circle Faucet](https://faucet.circle.com/)
- [x] Confirm nonzero ALGO and USDC balances for both accounts on Lora

### 1.4 Environment Configuration
- [x] Create `.env` from `.env.example`
- [x] Set `ALGORAND_NETWORK=testnet`
- [x] Set `PAY_TO_ADDRESS=<Receiver Public Address>`
- [x] Set `CLIENT_MNEMONIC="<Payer 25-word mnemonic>"`
- [x] Set `WALLET_ADDRESS=<Receiver Public Address>`
- [x] Set `DEMO_MODE=true`

### 1.5 Local Payment Rail Verification
- [ ] Start development server (`pnpm dev`) at `http://localhost:3000`
- [ ] Run `pnpm client:unpaid` ➔ **Verify HTTP 402 Payment Required** response
- [ ] Run `pnpm client:paid` ➔ **Verify automatic signature, facilitator settlement, and 200 OK**

### 1.6 On-Chain & Facilitator Confirmation
- [ ] Confirm transaction is recorded on [GoPlausible Facilitator Dashboard](https://facilitator.goplausible.xyz/dashboard)
- [ ] Confirm incoming USDC transaction on [Lora Explorer](https://lora.algokit.io/testnet) for Receiver address

---

## Phase 2: ADSEC Audit Engine (Tier 1 & Tier 2)

Objective: *Build the comprehensive multi-tier security audit pipeline and wire it to the x402 paid endpoint.*

### 2.1 Tier 1: Deterministic Engine (Fast, Free, No LLM)
- [ ] **Secret Scanner (`src/engine/secrets.ts`)**:
  - [ ] Scan for AWS/GCP keys, OpenAI tokens, private keys, JWTs, generic high-entropy strings
  - [ ] Output line numbers, masked secret previews, and remediation advice
- [ ] **Dangerous Pattern Scanner (`src/engine/patterns.ts`)**:
  - [ ] Python: `eval()`, `exec()`, `pickle.loads()`, `subprocess(shell=True)`, SQL concatenation
  - [ ] JavaScript/TypeScript: `eval()`, `dangerouslySetInnerHTML`, insecure regex (ReDoS), child_process
  - [ ] Solidity/Smart Contracts (optional bonus): reentrancy patterns, unchecked transfers
- [ ] **Dependency Typosquatting Checker (`src/engine/typosquat.ts`)**:
  - [ ] Levenshtein distance check against top 1,000 npm and PyPI package names
- [ ] **Outdated/Abandoned Dependency Flag (`src/engine/outdated.ts`)**:
  - [ ] Check package metadata via registry APIs (PyPI / npm registry)
- [ ] **Vulnerability & CVE Correlation (`src/engine/osv.ts`)**:
  - [ ] Query OSV.dev public API with package names + versions
  - [ ] Line-level correlation: flag actual code lines where vulnerable packages/functions are invoked
  - [ ] Severity ranking (CVSS score), deduplication, and normalized JSON output

### 2.2 Tier 2: Semantic Analysis & Auto-Fixes (LLM-Powered)
- [ ] Set up LLM client (OpenAI / Anthropic / Gemini API) in `src/engine/llm.ts`
- [ ] Structured prompt engineering enforcing strict JSON schema for findings
- [ ] Catch logic flaws regex misses: Broken Access Control, Auth Bypass, Insecure Business Logic
- [ ] **Actionable Diff Generator**: Generate git patch / unified diff snippets for each detected vulnerability

### 2.3 Endpoint & Multi-Tier Pricing Integration
- [ ] Configure `src/x402/config.ts`:
  - [ ] Tier 1: Cheap pricing (e.g. 0.05 USDC)
  - [ ] Tier 2: Premium pricing (e.g. 0.25 USDC) reflecting LLM compute costs
  - [ ] Define Bazaar metadata (service description, input/output schemas)
- [ ] Implement `POST /api/adsec/audit` in `src/routes/audit.ts` taking `{ code, language, tier, filename }`
- [ ] Attach settled on-chain Transaction ID to response metadata (Proof of Audit)
- [ ] Write automated unit tests for all rule engines (`pnpm test`)

---

## Phase 3: Web Dashboard, Deployment & Bazaar Discovery

Objective: *Create a stunning live demo interface, deploy to cloud hosting, and verify network indexing.*

### 3.1 Live Interactive Demo Dashboard (`src/web/`)
- [ ] Modern UI for demo day (Dark mode, glassmorphism, responsive layout)
- [ ] Code input area with syntax highlighting and pre-loaded sample vulnerabilities
- [ ] Tier selector (Tier 1 vs Tier 2) with dynamic price calculation
- [ ] Real-time audit report view:
  - [ ] Severity summary metrics (Critical, High, Medium, Low)
  - [ ] Interactive findings list with line-by-line code markers
  - [ ] Unified diff viewer for suggested fixes
  - [ ] Verified On-Chain Receipt Badge linked directly to Lora explorer

### 3.2 Production Deployment
- [ ] Select hosting provider: Render / Railway
- [ ] Set environment variables in hosting provider dashboard
- [ ] Deploy backend + frontend as a unified service
- [ ] Verify health check endpoint (`GET /health` or `GET /`)

### 3.3 Public Network & Bazaar Verification
- [ ] Run client test against **public live URL**:
  - [ ] Confirm unpaid request returns `402 Payment Required`
  - [ ] Confirm paid request settles on Algorand TestNet and returns full audit report
- [ ] Query GoPlausible Bazaar discovery endpoint to verify ADSEC is publicly indexed:
  ```bash
  curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000" | jq '.items[] | select(.resourceUrl | contains("<your-app-domain>"))'
  ```
- [ ] Set up free keep-alive ping on [cron-job.org](https://cron-job.org) hitting `/health` every 10 min to prevent cold starts during evaluation

### 3.4 Demo & Pitch Preparation
- [ ] Record a 60-second backup demo video of unpaid ➔ 402 ➔ paid ➔ 200 OK + on-chain receipt
- [ ] Prepare pitch narrative:
  1. **Problem:** Autonomous AI agents need instant, verifiable security auditing before deploying code.
  2. **Solution:** ADSEC as a native x402 pay-per-call node on the Algorand agent economy.
  3. **Live Demonstration:** Real 402 challenge, on-chain settlement, instant CVE/pattern analysis & diff fix.
  4. **Value & Differentiation:** Line correlation, multi-tier economic model, verifiable on-chain audit proof.
