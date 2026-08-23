# ADSEC: Pay-Per-Call Security Audits for AI Agents on Algorand

ADSEC is an HTTP security auditing service that autonomous AI agents pay to use per request, using micropayments in TestNet USDC settled on the Algorand blockchain through the x402 protocol. There are no accounts, API keys, or subscriptions. A valid payment is the only credential required.

[![Network](https://img.shields.io/badge/Network-Algorand%20TestNet-blue)](https://lora.algokit.io/testnet)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20HTTP%20Payment-green)](https://www.x402.org)
[![Facilitator](https://img.shields.io/badge/Facilitator-GoPlausible-orange)](https://facilitator.goplausible.xyz)
[![Asset](https://img.shields.io/badge/Currency-TestNet%20USDC%20ASA%2010458941-blueviolet)](https://lora.algokit.io/testnet/asset/10458941)

---

## 🏆 Verified On-Chain Submission Proof

| Proof Item | Value |
|---|---|
| **Settlement Network** | **Algorand TestNet** (CAIP-2: `algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=`) |
| **Asset Currency** | **TestNet USDC** (ASA ID: [`10458941`](https://lora.algokit.io/testnet/asset/10458941)) |
| **Facilitator Gateway** | **GoPlausible Facilitator** (`https://facilitator.goplausible.xyz`) |
| **Verified TxID #1 (Machine x402)** | [`KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ`](https://lora.algokit.io/testnet/transaction/KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ) *(Round 66557283)* |
| **Verified TxID #2 (Full Pipeline)** | [`EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA`](https://lora.algokit.io/testnet/transaction/EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA) *(Round 66579293)* |
| **Payer Account (Agent CLI)** | [`BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI`](https://lora.algokit.io/testnet/account/BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI) |
| **Receiver Account (ADSEC Node)** | [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ) |
| **Live Web Playground** | [https://adsec-frontend.onrender.com](https://adsec-frontend.onrender.com) |
| **Live Backend API** | [https://mesh402x.onrender.com](https://mesh402x.onrender.com) |

---

## The Problem

AI coding agents now write application code, smart contracts, and pull requests with very little human review. Before that code reaches production or a mainnet, it needs an independent security check. Existing options do not fit agents well:

- Enterprise SaaS scanners require accounts, dashboard signups, API keys, and monthly contracts.
- Static linters run locally but produce noise, have no concept of live CVEs, and cannot issue proof of review.
- Manual audits are slow and cost hundreds of dollars, which makes no sense for a throwaway agent-generated script.

An agent needs an audit it can buy in one HTTP call, settle in about two seconds, and verify cryptographically afterward.

## What This Project Does

ADSEC exposes four paid endpoints plus a free development endpoint. A client sends source code, the server replies with an invoice instead of a result, the client's wallet signs a small USDC transfer, and the server then returns the full audit:

1. Deterministic scanning for hardcoded secrets, dangerous syntax patterns, typosquatted package names, and known vulnerabilities from the live OSV.dev database.
2. Language-aware unified Git diff patches that fix the findings and apply cleanly with `git apply`.
3. An optional on-chain attestation: the SHA-256 hash of the code and the audit verdict are written into an Algorand transaction note, creating timestamped proof of review that anyone can verify on an explorer.

Every response includes the settlement transaction ID so the payment and the attestation can be confirmed independently.

## How It Differs

| | Traditional SaaS scanner | Local linter | ADSEC |
|---|---|---|---|
| Access model | Account, API key, monthly contract | Free | Payment per request, no identity |
| Minimum commitment | Subscription | None | A fraction of a cent in TestNet USDC |
| Live CVE data | Varies | Usually none | Queried from OSV.dev at request time |
| Automated fixes | Rarely | Limited | Unified Git diff, `git apply` compatible |
| Proof of audit | Private report | None | On-chain attestation verifiable on Lora |
| Designed for machines | Partially | No | Yes, plain HTTP with the x402 standard |

The core difference is economic rather than technical. Because settlement is native to the transport layer, any agent with a wallet can become a customer in a single request, and the provider gets paid before doing the work. That is what makes per-call pricing viable at micro scale.

## Why You Would Use It

- As a gate in an autonomous CI/CD pipeline: refuse to deploy code that has no paid audit attestation.
- Inside agent frameworks: let a coding agent self-check its output before opening a pull request.
- For smart contract preflight: catch leaked keys, unsafe patterns, and asset opt-in flaws before testnet deployment.
- As a reference implementation of x402 monetization on Algorand with a real, non-trivial paid resource behind the paywall.

## Architecture

```
+----------------------------------------------------------+
| Client: React playground, agent CLI, or any HTTP client  |
+------------------------------+---------------------------+
                               | 1. POST /adsec/audit  (unpaid)
                               v
+----------------------------------------------------------+
| ADSEC resource server (Hono + TypeScript, port 4021)     |
| x402 middleware prices the route and rejects with        |
| HTTP 402 Payment Required plus payment details           |
+------------------------------+---------------------------+
                               | 2. 402 challenge
                               v
+----------------------------------------------------------+
| GoPlausible facilitator                                  |
| Verifies the signed USDC transfer and settles it         |
| on Algorand TestNet                                      |
+------------------------------+---------------------------+
                               | 3. Client retries with payment header
                               v
+----------------------------------------------------------+
| Audit engine                                             |
| Tier 1: secrets, AST patterns, typosquatting, OSV.dev    |
| Tier 2: multi-provider LLM logic review + diff generator |
+------------------------------+---------------------------+
                               | 4. 200 OK
                               v
+----------------------------------------------------------+
| Findings + health score + Git patches + attestation TxID |
+----------------------------------------------------------+
```

## Repository Structure

```text
Mesh402X/
├── README.md                              # This document
├── checklist2.md                          # Project go-live checklist
├── GLOBAL_AGENT_GUIDE.md                  # Autonomous agent setup guide
│
└── x402-Project/
    ├── x402-demo-server/                  # Backend: x402 resource server
    │   ├── index.ts                       # Server entry, CORS, routes
    │   ├── endpoints.config.ts            # Paid routes, prices, discovery metadata
    │   ├── handlers/adsec-audit.ts        # Audit endpoint handlers
    │   ├── scripts/agent-audit.ts         # Terminal agent CLI
    │   └── engine/
    │       ├── scoring.ts                 # 0-100 security health score
    │       ├── tier1/                     # Secrets, patterns, typosquat, OSV
    │       └── tier2/                     # LLM review and diff generator
    │
    ├── 402-demo-client/                   # Headless Autonomous Agent Client
    │   ├── adsec-client.ts                # Live paid security audit runner
    │   ├── check-wallet.ts                # Wallet diagnostic tool
    │   └── optin-usdc.ts                  # Automated USDC opt-in script
    │
    └── X402-Usecase/projects/X402-Usecase/# Frontend: React playground
        └── src/
            ├── AdsecHome.tsx              # Landing page and live demo sections
            ├── AppWithTabs.tsx            # Global navigation and wallet context
            └── components/
                ├── AdsecPlayground.tsx    # Code editor, run controls, results
                ├── AsciiTerminal.tsx      # Live ASCII visualization of the flow
                └── OnChainLedger.tsx      # Immutable on-chain receipt ledger
```

## Prerequisites

- Node.js 20 or newer and npm 9 or newer.
- AlgoKit CLI: `pip install algokit`.
- A Pera or Defly wallet with your TestNet account imported.
- TestNet ALGO from the [Lora dispenser](https://lora.algokit.io/testnet/fund).
- TestNet USDC, asset ID 10458941, from the [Circle faucet](https://faucet.circle.com).

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/vishnunandan555/Mesh402X.git
cd Mesh402X
```

### 2. Start the backend resource server

```bash
cd x402-Project/x402-demo-server
npm install
cp .env.example .env
```

Edit `.env`:

```env
AVM_ADDRESS=LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
# Optional, enables Tier 2 AI review and diff generation
GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

Start it:

```bash
npm start
```

Confirm it is up:

```bash
curl http://localhost:4021/health
```

### 3. Start the frontend playground

Open a second terminal:

```bash
cd x402-Project/X402-Usecase/projects/X402-Usecase
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Verify the Transaction Flow End to End

### Web playground path

1. Open `http://localhost:5173` (or `https://adsec-frontend.onrender.com`).
2. Click **Connect Wallet** and approve in Pera or Defly.
3. Load a vulnerable preset (e.g. "Python: SQLi + Leaked Key").
4. Click **Pay & Audit with x402**.
5. Approve in wallet ➔ Watch live ASCII pipeline animation.
6. View health score, findings with CWE tags, and actionable Git diff patch.

### Free dev test path

Click **Free Dev Test** instead to call `POST /adsec/dev-audit` for instant testing with 0 USDC.

### Agent CLI path

```bash
cd x402-Project/402-demo-client
npm run audit:scan
```

The CLI receives the 402 challenge, signs the payment autonomously with its mnemonic account, prints findings and Git diffs, and logs the settlement transaction ID.

## Verified On-Chain Proof

| Item | Value |
|---|---|
| Settlement network | Algorand TestNet |
| Asset | TestNet USDC, ASA [10458941](https://lora.algokit.io/testnet/asset/10458941) |
| Machine x402 audit transaction | [`KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ`](https://lora.algokit.io/testnet/transaction/KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ), round 66557283 |
| Full pipeline transaction | [`EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA`](https://lora.algokit.io/testnet/transaction/EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA), round 66579293 |
| Receiver account | [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ) |

## License

MIT
