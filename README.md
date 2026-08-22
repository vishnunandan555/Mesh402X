# 🛡️ ADSEC — Autonomous Decentralized Security Audit Service

> **x402 Pay-Per-Call Code Security Auditing on Algorand TestNet**  
> Built for the **x402 Global Challenge / Hackathon Sprint**

[![Network](https://img.shields.io/badge/Network-Algorand%20TestNet-blue)](https://lora.algokit.io/testnet)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-green)](https://x402.money)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible-orange)](https://facilitator.goplausible.xyz)
[![Asset](https://img.shields.io/badge/Currency-TestNet%20USDC%20(ASA%2010458941)-blueviolet)](https://lora.algokit.io/testnet/asset/10458941)
[![Backend](https://img.shields.io/badge/Backend-Hono%20%2B%20TypeScript-yellow)](https://hono.dev)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-cyan)](https://vitejs.dev)

---

## 📌 Overview

**ADSEC** is an AI agent-ready, pay-per-call **Code Security Audit API** deployed as a compliant resource node on the open **x402 payment network** on Algorand.

When developers or autonomous AI agents submit source code for security review:
1. ADSEC challenges the request with **HTTP `402 Payment Required`**.
2. The caller's wallet signs a micro-payment in **TestNet USDC** via the **GoPlausible Facilitator**.
3. Upon on-chain settlement, ADSEC executes deterministic security scanners, queries the **OSV.dev CVE database**, performs **LLM semantic logic reviews**, and returns actionable **Git diff patches** alongside an **on-chain Proof-of-Audit receipt**.

---

## 🚀 Key Features

* **⚡ Tier 1 — Deterministic Audit (Instant & Low-Cost)**:
  * **Secret & Credential Scanner:** Detects exposed AWS/GCP keys, OpenAI tokens, GitHub PATs, JWTs, and private keys.
  * **Dangerous Code Patterns:** Detects `eval()`, SQL string concatenation, unsafe deserialization (`pickle`, `yaml`), ReDoS, and prototype pollution.
  * **Dependency Typosquatting:** Levenshtein edit-distance checks against top 500 npm/PyPI packages.
  * **CVE Database Correlation:** Queries the free public **OSV.dev API** and correlates vulnerable functions directly to the exact code line calling them.
* **🧠 Tier 2 — AI Semantic Logic Review & Auto-Fixes**:
  * Catches subtle business logic flaws, broken access control (BOLA/IDOR), and auth bypasses.
  * Emits actionable **unified Git diff patches** ready to apply via `git apply`.
* **⛓️ On-Chain Proof-of-Audit**:
  * Every audit receipt includes the confirmed Algorand TestNet transaction ID, verifiable directly on [Lora Explorer](https://lora.algokit.io/testnet).
* **🌐 Open Bazaar Discovery**:
  * Declares x402 Bazaar metadata so any autonomous agent can discover and invoke ADSEC automatically.

---

## 🏗️ Architecture & Workflow

```
┌─────────────────┐        HTTP POST (Unpaid)         ┌───────────────────────────────┐
│ AI Coding Agent │ ────────────────────────────────> │      ADSEC Resource Server    │
│  or Web User    │ <──────────────────────────────── │     (Hono + @x402/hono)       │
└─────────────────┘      402 Payment Required         └───────────────────────────────┘
         │               (Price: $0.05 - $0.25)                      │
         │                                                           │
         ▼ Signs Micro-payment                                       │
┌─────────────────────────────┐   Verifies & Settles Tx              │
│   GoPlausible Facilitator   │ ───────────────────────────┐         │
└─────────────────────────────┘                            │         │
         │                                                 ▼         │
         ▼ Broadcasts                               ┌────────────────▼────────────────┐
┌─────────────────────────────┐                     │   ADSEC Core Security Engine    │
│    Algorand TestNet Node    │                     │   • Secret Regex Scanner        │
│   (USDC ASA: 10458941)      │                     │   • Dangerous Pattern Detector  │
└─────────────────────────────┘                     │   • OSV.dev CVE Query           │
         │                                          │   • Typosquatting Checker       │
         │ Confirmed Tx Receipt                     │   • Tier-2 LLM Diff Generator   │
         ▼                                          └────────────────┬────────────────┘
┌─────────────────┐    HTTP 200 OK (Findings + Diff)                 │
│ Audited Code &  │ <────────────────────────────────────────────────┘
│ On-Chain Proof  │
└─────────────────┘
```

---

## 📂 Repository Structure

```text
Mesh402X/
├── checklist.md                        # Master project progress checklist
├── Phase 2 Build Plan.md               # Security engine architecture & contract
├── full-setup.md                       # Comprehensive 3-day build plan
├── pre-setup.md                        # Infrastructure & wallet setup guide
│
└── x402-Project/                       # x402 Hackathon Starter Implementation
    ├── x402-demo-server/               # Backend Resource Server
    │   ├── index.ts                    # Main Hono server & x402 payment middleware
    │   ├── endpoints.config.ts         # Payment endpoints & Bazaar discovery metadata
    │   ├── handlers/                   # Route handlers (ADSEC security audits)
    │   └── package.json                # Dependencies (@x402/hono, @x402/avm)
    │
    └── X402-Usecase/                   # Frontend Web Application
        └── projects/X402-Usecase/      # React + Vite + Tailwind dashboard
            ├── src/                    # UI Components & Pera Wallet integration
            └── package.json            # Uses @x402-avm/fetch client wrapper
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** 18+ and `npm`
- **Algorand TestNet Wallet** (e.g. [Lora](https://lora.algokit.io/testnet) or [Pera Wallet](https://perawallet.app))
- **TestNet ALGO** from [Lora Faucet](https://lora.algokit.io/testnet/fund)
- **TestNet USDC** (ASA `10458941`) from [Circle Faucet](https://faucet.circle.com/)

---

### 2. Backend Setup (`x402-demo-server`)

```bash
cd x402-Project/x402-demo-server
npm install
cp .env.example .env
```

Edit `.env`:
```env
AVM_ADDRESS=YOUR_ALGORAND_TESTNET_RECEIVER_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
```

Start the backend:
```bash
npm run dev
```
*Server runs at `http://localhost:4021`.*

---

### 3. Frontend Setup (`X402-Usecase`)

```bash
cd x402-Project/X402-Usecase/projects/X402-Usecase
npm install
```

Configure `.env.local`:
```env
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_NETWORK=testnet
VITE_API_BASE_URL=http://localhost:4021
VITE_FACILITATOR_URL=https://facilitator.goplausible.xyz
```

Start the frontend:
```bash
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🧪 Testing the Payment Flow

### Unpaid Request (Expect HTTP 402)
```bash
curl -i http://localhost:4021/weather
```
*Returns `HTTP/1.1 402 Payment Required` with payment headers.*

### In-Browser Paid Flow
1. Open `http://localhost:5173`.
2. Connect your **Pera / Defly Wallet** on TestNet.
3. Click to execute the security audit.
4. Sign the micro-payment in your wallet.
5. The report renders instantly, and the transaction is recorded on [Lora Explorer](https://lora.algokit.io/testnet).

---

## 📋 Evaluation Criteria Verification

* **✅ Live x402 on Algorand TestNet:** Verified via GoPlausible Facilitator.
* **✅ Verified Dependencies:** Uses `@x402/hono`, `@x402/avm`, and `@x402-avm/extensions`.
* **✅ Autonomous Agent Ready:** Clean JSON schema + Bazaar discovery registration.
* **✅ On-Chain Verification:** Confirmed ASA `10458941` USDC transfer on Lora Explorer.

---

## 📄 License
MIT License
