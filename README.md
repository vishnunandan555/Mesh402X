# ADSEC - Autonomous Decentralized Security Audit Node

> **x402 Pay-Per-Call Code Security Auditing for AI Agents on Algorand TestNet**  
> Built for the **x402 Global Challenge**

[![Network](https://img.shields.io/badge/Network-Algorand%20TestNet-blue)](https://lora.algokit.io/testnet)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-green)](https://x402.money)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible-orange)](https://facilitator.goplausible.xyz)
[![Asset](https://img.shields.io/badge/Currency-TestNet%20USDC%20(ASA%2010458941)-blueviolet)](https://lora.algokit.io/testnet/asset/10458941)
[![Backend](https://img.shields.io/badge/Backend-Hono%20%2B%20TypeScript-yellow)](https://hono.dev)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-cyan)](https://vitejs.dev)

---

## 1. What is ADSEC?

**ADSEC** is an on-demand, pay-per-call **Code Security Audit API, Agent CLI, and Web3 Dashboard** running as a live x402 node on Algorand TestNet.

When autonomous AI coding agents generate code, deploy smart contracts, or prepare pull requests, they cannot safely ship without a verifiable security review. ADSEC gives agents and developers an automated, instant security auditor paid via micro-payments in **TestNet USDC (ASA 10458941)** through the **GoPlausible Facilitator**.

---

## 2. Key Capabilities & The 3 Green Cards Pipeline

ADSEC implements a modular 3-stage security pipeline where each stage is a standalone x402 payment endpoint:

1. **Card 1: Pre-Flight Deterministic Scanner (`POST /adsec/scan` - $0.01 USDC)**
   - **Secret & Token Scanner:** High-precision detection of exposed AWS/GCP keys, OpenAI keys (`sk-...`), GitHub PATs, JWTs, and private keys.
   - **Dangerous Pattern Detector:** Detects `eval()`, SQL string injection, unsafe deserialization (`pickle.loads`, `yaml`), and shell command injection.
   - **Typosquatting Package Checker:** Levenshtein edit-distance algorithm checking against top npm/PyPI libraries (e.g. `reqeusts` vs `requests`).
   - **OSV.dev CVE Database Query:** Live HTTP queries to Google OSV database correlated directly to calling code lines.

2. **Card 2: Auto-Remediation Patch Generator (`POST /adsec/remediate` - $0.03 USDC)**
   - **Language-Aware Unified Diff Generator:** Generates actionable unified Git diff patches (`--- a/ +++ b/`) formatted for `git apply`.
   - **Multi-Provider Semantic Fallback:** Groq (Llama-3.3-70B in <300ms) ➔ Google Gemini 1.5 Flash ➔ OpenAI GPT-4o-mini ➔ Deterministic rules.

3. **Card 3: Cryptographic On-Chain Attestation (`POST /adsec/attest` - $0.01 USDC)**
   - Calculates SHA-256 code hash and broadcasts a real 0-ALGO note transaction carrying the cryptographic Proof-of-Audit certificate (`adsec:v1;sha256:...;score:...`) directly to Algorand TestNet.

4. **Unified Suite (`POST /adsec/audit` - $0.05 USDC)**
   - All-in-one execution of scanning, diff patch generation, and on-chain attestation in a single call.

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
│   - Facilitator broadcasts & settles on Algorand       │
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
                            │ 4. Broadcasts On-Chain Attestation Note
                            │ 5. HTTP 200 OK (Findings + Diff + Lora TxID)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Agent Auto-Applies Git Patch               │
│   - Verified on Algorand TestNet Lora Explorer         │
└────────────────────────────────────────────────────────┘
```

---

## 4. Wallet Architecture: Payer vs. Receiver

| Role | Who Holds It | Config Variable | How It Works |
| :--- | :--- | :--- | :--- |
| **🏪 Receiver (ADSEC Node)** | Service Owner | `AVM_ADDRESS` | **Fixed & Public.** Configured in Render backend. Every caller pays USDC into this address to unlock endpoints. |
| **🤖 Payer (User / Agent)** | Independent Users / AI Agents | `PAYER_MNEMONIC` or Browser Wallet | **Dynamic per user.** Funded with TestNet ALGO & USDC to autonomously sign micro-transactions on demand. |

---

## 5. Zero-Web2 On-Chain Ledger & Dashboard

ADSEC does not require any Web2 database or email/password sign-in:
- **Identity:** Connecting a wallet (Pera / Defly / Lute) acts as instant Web3 authentication.
- **Ledger:** The frontend queries the **Algorand Indexer API** (`https://testnet-idx.algonode.cloud/v2/accounts/...`) in real-time.
- **User View:** Lists all past audits, dates, USDC paid, and direct links to **Lora Explorer**.
- **Admin View:** Displays total node revenue, settlement volume, and active GoPlausible Bazaar routes.

---

## 6. Live Deployment & Discovery Links

- **Live Frontend App (Playground & Ledger):** `https://adsec-app.vercel.app` (or Vercel deployment URL)
- **Live Backend API (Render Node):** `https://adsec-backend.onrender.com`
- **GoPlausible Global Discovery Registry:**  
  `https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true`
- **Lora TestNet Explorer:**  
  `https://lora.algokit.io/testnet`

---

## 7. Quick Start & CLI Usage

### Prerequisites
- Node.js v18+ and npm / pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Discover ADSEC on the Global Bazaar & Run Audit
```bash
cd x402-Project/x402-demo-server
npm run discover
```

### 3. Run Live On-Chain Agent with Automated USDC Payment
```bash
cd x402-Project/x402-demo-server
npm run live https://adsec-backend.onrender.com
```

### 4. Run Frontend Locally
```bash
cd x402-Project/X402-Usecase/projects/X402-Usecase
npm run dev
```

---

## 8. Verified Dependencies (@x402 / avm)

Our codebase uses the official `@x402` and `@x402-avm` packages:
- `@x402/hono`: x402 payment middleware for Hono.
- `@x402/core`: Resource server and facilitator client engine.
- `@x402/avm`: Algorand Virtual Machine exact payment scheme and signers.
- `@x402-avm/extensions`: GoPlausible Bazaar dynamic discovery metadata declaration.
- `@x402-avm/fetch`: Automated 402 interceptor and client-side payment wrapper.
- `@txnlab/use-wallet-react`: Pera, Defly, Exodus, and Lute wallet connection provider.
