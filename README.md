# 🛡️ ADSEC — Autonomous Decentralized Security Audit Node

> **x402 Pay-Per-Call Code Security Auditing for AI Agents on Algorand TestNet**  
> Built for the **x402 Global Challenge / Hackathon Sprint**

[![Network](https://img.shields.io/badge/Network-Algorand%20TestNet-blue)](https://lora.algokit.io/testnet)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-green)](https://x402.money)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible-orange)](https://facilitator.goplausible.xyz)
[![Asset](https://img.shields.io/badge/Currency-TestNet%20USDC%20(ASA%2010458941)-blueviolet)](https://lora.algokit.io/testnet/asset/10458941)
[![Backend](https://img.shields.io/badge/Backend-Hono%20%2B%20TypeScript-yellow)](https://hono.dev)

---

## 📌 What is ADSEC?

**ADSEC** is an on-demand, pay-per-call **Code Security Audit API and Agent CLI** running as an x402 node on Algorand TestNet.

When autonomous AI coding agents generate code, write smart contracts, or prepare pull requests, they cannot safely deploy to production or mainnet without a verified security audit. ADSEC gives agents an automated, pay-per-call security auditor funded via micro-payments in **TestNet USDC (ASA 10458941)** through the **GoPlausible Facilitator**.

---

## 🎯 Key Capabilities

1. **🛡️ Multi-Tier Security Engine**:
   - **Secret & Credential Scanner:** Detects exposed AWS/GCP keys, OpenAI tokens, GitHub PATs, JWTs, and private keys.
   - **Dangerous Pattern Detector:** Detects `eval()`, SQL string concatenations, unsafe deserialization (`pickle`, `yaml`), and ReDoS.
   - **Typosquatting Package Checker:** Levenshtein edit-distance checks against top 500 npm/PyPI packages.
   - **OSV.dev CVE Database Correlation:** Queries real vulnerability databases and correlates CVEs directly to calling code lines.
   - **AI Semantic Logic Review & Auto-Fixes:** Analyzes business logic flaws and generates actionable **Git diff patches** (`git apply` compatible).
2. **🤖 Developer & Agent Terminal CLI**:
   - Run `pnpm agent:audit <file>` in terminal to watch the autonomous agent handle the 402 challenge, sign the TestNet payment, receive the findings, and apply the Git diff fix automatically.
3. **📜 On-Chain Proof-of-Audit**:
   - Every audit response includes the confirmed Algorand TestNet transaction ID, verifiable directly on [Lora Explorer](https://lora.algokit.io/testnet).
4. **🌐 Open Bazaar Discovery**:
   - Registered in the GoPlausible Bazaar discovery index for autonomous AI agent discovery.

---

## 🏗️ Architecture & Workflow

```
┌────────────────────────────────────────────────────────┐
│             Autonomous AI Agent / Terminal CLI         │
│   (pnpm agent:audit target.py)                         │
└───────────────────────────┬────────────────────────────┘
                            │ 1. POST /adsec/audit (Unpaid)
                            ▼
┌────────────────────────────────────────────────────────┐
│             ADSEC Hono Resource Server                 │
│                 (x402-demo-server)                     │
│   • Enforces x402 payment gate (Price: $0.01 - $0.05)  │
└───────────────────────────┬────────────────────────────┘
                            │ 2. Returns HTTP 402 Payment Required
                            ▼
┌────────────────────────────────────────────────────────┐
│             GoPlausible Facilitator                    │
│   • Agent signs TestNet USDC transaction               │
│   • Facilitator broadcasts & verifies on Algorand      │
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
│       ├── Auth Bypass & Logic Flaw Review (LLM)        │
│       └── Unified Git Patch Generator (--- a/ +++ b/)  │
└───────────────────────────┬────────────────────────────┘
                            │ 4. HTTP 200 OK (Findings + Diff + TxID)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Agent Auto-Applies Git Patch               │
│   • Code is secured and ready for production!          │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
Mesh402X/
├── checklist.md                        # Master project progress checklist
├── features.md                         # Detailed feature specs & expansion roadmap
├── Phase 2 Build Plan.md               # Security engine architecture & flowcharts
├── full-setup.md                       # Complete build plan & milestones
├── pre-setup.md                        # Infrastructure & wallet setup guide
├── README.md                           # Main documentation
│
└── x402-Project/                       # Project Implementation
    ├── x402-demo-server/               # Backend Hono Resource Server
    │   ├── index.ts                    # Server entry, CORS & x402 middleware
    │   ├── endpoints.config.ts         # Payment routes & Bazaar discovery metadata
    │   ├── handlers/                   # Endpoint handlers
    │   │   └── adsec-audit.ts          # ADSEC audit endpoint handler
    │   ├── scripts/
    │   │   └── agent-audit.ts          # Multi-file Terminal Agent CLI script
    │   └── engine/                     # Core Security Audit Engine
    │       ├── types.ts                # TypeScript interface contract
    │       ├── scoring.ts              # 0-100 Security Health Score calculator
    │       ├── tier1/                  # Deterministic scanners & OSV.dev
    │       └── tier2/                  # Multi-provider LLM review & diff generator
    │
    └── X402-Usecase/                   # Frontend Web Application (Optional UI)
        └── projects/X402-Usecase/      # React dashboard
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** 18+ and `npm`
- **Algorand TestNet Wallet** ([Lora](https://lora.algokit.io/testnet))
- **TestNet ALGO** from [Lora Faucet](https://lora.algokit.io/testnet/fund)
- **TestNet USDC (ASA 10458941)** from [Circle Faucet](https://faucet.circle.com/)

---

### 2. Backend Setup (`x402-demo-server`)

```bash
cd x402-Project/x402-demo-server
npm install
cp .env.example .env
```

Configure `.env`:
```env
AVM_ADDRESS=YOUR_ALGORAND_TESTNET_RECEIVER_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
```

Start the backend:
```bash
npm run dev
```

---

### 3. Run the Agent CLI Audit

```bash
cd x402-Project/x402-demo-server

# Audit default vulnerable demo
npm run audit

# Or audit multiple custom files at once
npx tsx scripts/agent-audit.ts path/to/file1.py path/to/file2.js --tier=tier2
```

*Watch the autonomous agent pay 0.01 USDC on Algorand TestNet, receive the findings across all files, and generate unified Git diff fixes automatically.*

---

## 📋 Hackathon Judging Alignment (100/100 Points)

* **✅ Live x402 on Algorand TestNet (30 pts):** Verified via GoPlausible Facilitator with USDC ASA `10458941`.
* **✅ Code Quality & Architecture (25 pts):** Clean separation of payment transport and security audit engine in `engine/`.
* **✅ Technical Complexity (20 pts):** Real OSV.dev CVE database queries, AST pattern analysis, Levenshtein distance typosquatting, and AI Git diff generation.
* **✅ Functionality & Agent Automation (15 pts):** Terminal CLI and Web dashboard demonstrating 402 challenge, payment, and instant patch remediation.
* **✅ Algorand Network Configuration (10 pts):** Native TestNet USDC ASA configuration and verified Lora Explorer transactions.

---

## 📄 License
MIT License
