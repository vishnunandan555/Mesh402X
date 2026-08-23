# 🐍 MEDUSA: Pay-Per-Call Autonomous Security Audits for AI Agents on Algorand

**Medusa** (ADSEC) is a decentralized HTTP security auditing node that autonomous AI agents and developers pay to use per request, using micropayments in **TestNet USDC** settled on the **Algorand blockchain** through the **x402 protocol**. 

There are **no accounts, API keys, logins, or subscriptions**. A valid on-chain payment is the only credential required.

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
| **Receiver Account (Medusa Node)** | [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ) |
| **Live Web Playground** | [https://adsec-frontend.onrender.com](https://adsec-frontend.onrender.com) |
| **Live Backend API** | [https://mesh402x.onrender.com](https://mesh402x.onrender.com) |

---

## ⚡ 1-Line Universal Installer for Any External Repository

To enable autonomous pay-per-call security audits in **any codebase**, run this single command in the project root:

```bash
curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
```

**What this does automatically:**
1. Installs `@x402-avm/fetch` & `algosdk`.
2. Sets up your agent's Algorand wallet in `.env`.
3. Downloads the modular `medusa-scripts/` suite.
4. Configures `Medusa_Skill.md` and `.agents/skills/medusa-audit/SKILL.md` so AI agents (Antigravity, Cursor, Claude) understand Medusa natively.

---

## 💎 Medusa Capabilities & Modular Tier Pricing

All paid tiers settle via **TestNet USDC (ASA ID `10458941`)** at **$0.001 (1,000 microUSDC)** per request.

| Tier / Feature | Endpoint | Price | Modular Script | Features |
|---|---|---|---|---|
| ⚡ **Pre-Flight Scanner** | `POST /adsec/scan` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-scan.ts <file>` | Static AST syntax hazards, leaked keys, typosquats & live OSV.dev CVEs. |
| 🩹 **Auto-Remediator** | `POST /adsec/remediate` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-remediate.ts <file>` | Language-aware unified Git diff patches (`git apply` compatible). |
| ⛓️ **On-Chain Attestation** | `POST /adsec/attest` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-attest.ts <file>` | SHA-256 code digest broadcasted as an immutable Algorand note certificate. |
| 🚀 **Full Security Suite** | `POST /adsec/audit` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-full.ts <file>` | Complete pipeline: Scan + LLM Logic Review + Git Diffs + Attestation. |
| 🟢 **Free Dev Test** | `POST /adsec/dev-audit` | **$0.00** | `npx tsx medusa-scripts/audit-dev.ts <file>` | Zero-token rapid testing without wallet or TestNet funds. |

---

## 🤖 Dual-Mode Operation

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                    MEDUSA ECOSYSTEM                         │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
     ┌───────────────────────────────┐                                                 ┌───────────────────────────────┐
     │   MODE 1: AGENT-TO-AGENT      │                                                 │   MODE 2: HUMAN-TO-AGENT (WEB)│
     ├───────────────────────────────┤                                                 ├───────────────────────────────┤
     │ • 1-line install in any repo  │                                                 │ • Tab 1: Agent & Dev Guide    │
     │ • Medusa_Skill.md specification│                                                │   - 1-click copy installer    │
     │ • Headless x402 sign & settle │                                                 │   - Live Bazaar registry      │
     │ • Auto-heal with `git apply`  │                                                 │ • Tab 2: Live Web Playground  │
     │ • Zero human popups or logins │                                                 │   - Pera/Defly Wallet connect │
     └───────────────────────────────┘                                                 └───────────────────────────────┘
```

---

## 🚀 Quickstart: Prompting Your AI Agent

Once `install.sh` has run in your target repo, simply type into your AI assistant chat (Antigravity, Cursor, Claude Code):

> 💬 *"Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof."*

**What your agent does autonomously:**
1. Evaluates your code against `Medusa_Skill.md`.
2. Chooses the appropriate script from `medusa-scripts/`.
3. Handles the HTTP 402 challenge, signs $0.001 USDC with `AGENT_MNEMONIC`.
4. Applies `git apply audit.patch` to self-heal the repository.
5. Emits the health score and verifiable Lora Explorer link.

---

## 🌐 Dynamic Discovery via GoPlausible Bazaar

Any external autonomous agent can dynamically discover this service from the decentralized catalog:

```bash
curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000"
```

The catalog returns the full OpenAPI schema, pricing (`1000` microUSDC), and parameter definitions for all Medusa endpoints.

---

## 📦 Repository Structure

```text
Mesh402X/
├── install.sh                             # 1-line universal installer for any repo
├── Medusa_Skill.md                        # Master AI Agent Skill specification
├── README.md                              # This document
├── ARCHITECTURE.md                        # Architectural specification
├── GLOBAL_AGENT_GUIDE.md                  # Autonomous agent setup guide
│
├── medusa-scripts/                        # Modular audit and wallet scripts
│   ├── audit-full.ts                      # Full All-in-One Audit ($0.001 USDC)
│   ├── audit-scan.ts                      # Pre-Flight Scanner ($0.001 USDC)
│   ├── audit-remediate.ts                 # Git Diff Auto-Remediation ($0.001 USDC)
│   ├── audit-attest.ts                    # On-Chain Attestation ($0.001 USDC)
│   ├── audit-dev.ts                       # Free Dev Mode ($0.00)
│   ├── check-wallet.ts                    # Wallet balance diagnostic
│   ├── optin-usdc.ts                      # 1-click USDC ASA opt-in
│   └── generate-wallet.ts                 # Keypair generator
│
├── .agents/skills/medusa-audit/           # Antigravity/Agent skill bundle
│   └── SKILL.md
│
└── x402-Project/
    ├── x402-demo-server/                  # Backend: Hono x402 Resource Server
    │   ├── index.ts                       # Server entry, CORS, routes
    │   ├── endpoints.config.ts            # Paid routes, prices, discovery metadata
    │   ├── handlers/adsec-audit.ts        # Audit endpoint handlers
    │   └── engine/                        # Deterministic AST, secrets & LLM engine
    │
    └── X402-Usecase/projects/X402-Usecase/# Frontend: Dual-Mode React App
        └── src/
            ├── AppWithTabs.tsx            # Header & Tab Switcher (Guide vs Playground)
            ├── AdsecHome.tsx              # Web Playground landing & runner
            └── components/
                ├── AgentGuidePage.tsx     # Dedicated Agent & Dev Guide tab
                ├── AdsecPlayground.tsx    # Code editor, controls, results
                ├── AsciiTerminal.tsx      # Live ASCII payment pipeline
                └── OnChainLedger.tsx      # Immutable on-chain receipt ledger
```

---

## 🔍 On-Chain Verification on Lora Explorer
Every payment and on-chain attestation is publicly verifiable on Algorand TestNet:
- **Lora Explorer:** [https://lora.algokit.io/testnet](https://lora.algokit.io/testnet)
- **Direct Attestation Tx Link:** `https://lora.algokit.io/testnet/transaction/<TRANSACTION_ID>`
- **Medusa Receiver Account:** [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ)

---

## License

MIT
