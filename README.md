# MEDUSA: Autonomous Pay-Per-Call Security Audit Protocol on Algorand (x402)

![Algorand](https://img.shields.io/badge/Algorand-000000?style=flat&logo=algorand&logoColor=white) ![USDC](https://img.shields.io/badge/USDC-2775CA?style=flat&logo=usdcoin&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=black) [![License](https://img.shields.io/badge/License-MIT-3b82f6?style=flat)](LICENSE)

<br/>

Medusa is a decentralized security audit protocol and on-chain intelligence node built for autonomous AI agents and developers. It provides automated security vulnerability analysis, multi-ecosystem CVE scanning, AI semantic code reviews, verified Git diff patches, and on-chain cryptographic attestations.

All operations are monetized via the **x402 payment standard** and settled on the **Algorand TestNet blockchain** using **TestNet USDC (ASA ID 10458941)**.

There are no accounts, subscriptions, API keys, or manual logins. Machine-to-machine payment verification on Algorand consensus is the single authorization layer.

---

## Quick Navigation & Resources

[![Launch DApp](https://img.shields.io/badge/-Launch%20DApp-00F5D4?style=flat&logo=googlechrome&logoColor=black)](https://adsec-frontend.onrender.com) [![API Discovery](https://img.shields.io/badge/-Bazaar%20Discovery-FFE600?style=flat&logo=fastapi&logoColor=black)](https://mesh402x.onrender.com/adsec/discovery) [![ALGO Dispenser](https://img.shields.io/badge/-ALGO%20Dispenser-06D6A0?style=flat&logo=algorand&logoColor=black)](https://lora.algokit.io/testnet/dispenser) [![Circle USDC Faucet](https://img.shields.io/badge/-Circle%20USDC%20Faucet-38BDF8?style=flat&logo=usdcoin&logoColor=black)](https://faucet.circle.com)

---

## Overview

**Medusa** is a decentralized security audit protocol and on-chain intelligence node built for autonomous AI agents, CI/CD pipelines, and developers. It provides automated security vulnerability analysis, multi-ecosystem CVE scanning, AI semantic code reviews, verified Git diff patches, and on-chain cryptographic attestations.

All operations are monetized via the **x402 payment standard** and settled on the **Algorand TestNet blockchain** using **TestNet USDC (ASA ID 10458941)** at **$0.001 USDC / audit**.

> **No Accounts. No Subscriptions. No API Keys.**  
> Machine-to-machine payment verification on Algorand consensus is the single authorization layer.

---

## Verified On-Chain Submission Proof

| Parameter | Value / Proof Link | Status |
|---|---|---|
| **Settlement Network** | `Algorand TestNet` (`algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=`) | ![Consensus Verified](https://img.shields.io/badge/Consensus-Verified-06D6A0?style=flat&logoColor=black) |
| **Asset Currency** | [TestNet USDC (ASA ID: 10458941)](https://lora.algokit.io/testnet/asset/10458941) | ![ASA Active](https://img.shields.io/badge/ASA-Active-2775CA?style=flat) |
| **Facilitator Gateway** | [GoPlausible Facilitator](https://facilitator.goplausible.xyz) | ![x402 Compliant](https://img.shields.io/badge/x402-Compliant-FFE600?style=flat&logoColor=black) |
| **Machine Settlement TxID #1** | [`KYDRKTKYR4Y5...`](https://lora.algokit.io/testnet/transaction/KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ) *(Round 66557283)* | ![Lora Confirmed](https://img.shields.io/badge/Lora-Confirmed-06D6A0?style=flat&logoColor=black) |
| **Full Pipeline TxID #2** | [`EZD7DHBD64QR...`](https://lora.algokit.io/testnet/transaction/EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA) *(Round 66580433)* | ![Lora Confirmed](https://img.shields.io/badge/Lora-Confirmed-06D6A0?style=flat&logoColor=black) |
| **Payer Account (Agent CLI)** | [`BLZQISYSYJSO...`](https://lora.algokit.io/testnet/account/BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI) | ![Agent Wallet](https://img.shields.io/badge/Agent_Wallet-Funded-8E44AD?style=flat) |
| **Receiver Account (Node)** | [`LG24FUHIBJEL...`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ) | ![Node Online](https://img.shields.io/badge/Medusa_Node-Online-00F5D4?style=flat&logoColor=black) |
| **Live Web DApp** | [https://adsec-frontend.onrender.com](https://adsec-frontend.onrender.com) | ![Web DApp Live](https://img.shields.io/badge/Web_DApp-Live-06D6A0?style=flat&logoColor=black) |
| **Live Resource Server** | [https://mesh402x.onrender.com](https://mesh402x.onrender.com) | ![API 200 OK](https://img.shields.io/badge/API-200_OK-00F5D4?style=flat&logoColor=black) |

---

## Token & Gas Fee Model

| Asset | Type | Purpose | Amount Per Call | Faucet / Dispenser Link |
|---|---|---|---|---|
| **ALGO** | Native Token | Blockchain Gas Fee | `0.001 ALGO / tx` | [Lora TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) |
| **USDC** | ASA ID #10458941 | Medusa Audit Fee | `$0.001 USDC` *(1,000 µUSDC)* | [Circle USDC Faucet](https://faucet.circle.com) |

---

## 1-Line Universal Installer

To configure Medusa in any existing or new repository, run:

```bash
curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
```

### What the installer configures:
1. Installs `@x402-avm/fetch`, `@x402-avm/avm`, `@modelcontextprotocol/sdk`, and `algosdk`.
2. Sets up `mcp-server/` and registers [.agents/mcp_config.json](.agents/mcp_config.json) for native tool use.
3. Downloads the modular `medusa-scripts/` suite.
4. Generates `AGENTS.md` and `Medusa_Skill.md` for assistant discoverability.
5. Configures and sanitizes `wallet.env` with your 25-word Algorand TestNet mnemonic.

---

## Native Model Context Protocol (MCP) Server

Medusa exposes a native Model Context Protocol (MCP) Server over standard JSON-RPC (`stdio`). This allows AI coding assistants (**Google Antigravity**, **Claude Desktop**, **Cursor**, **OpenCode**) to execute audits as native cognitive tools without subprocess shell scripts.

### Registered MCP Tools:

| Tool Identifier | Parameters | Function | Cost |
|---|---|---|---|
| `medusa_audit_file` | `filePath`, `applyRemediation` | Full all-in-one audit: AST/CVE scan, LLM review, Git diffs, attestation. | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) |
| `medusa_get_security_score` | `filePath`, `minScoreThreshold` | Calculates 0-100 score on code/manifests and evaluates pass/fail gate. | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) |
| `medusa_scan_code` | `filePath` | Pre-flight deterministic AST, secret, and OSV.dev CVE scan. | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) |
| `medusa_remediate_file` | `filePath`, `applyPatch` | Generates language-aware `git apply` unified diff patches to fix flaws. | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) |
| `medusa_attest_code` | `filePath`, `score` | Computes SHA-256 code digest and broadcasts proof note to Algorand. | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) |
| `medusa_discover_nodes` | `limit` | Queries GoPlausible Bazaar catalog for live active security nodes. | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) |
| `medusa_check_wallet` | — | Diagnostics: Checks ALGO gas balance, USDC balance, opt-in status. | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) |
| `medusa_get_financial_ledger` | `limit` | On-chain ledger explorer: shows transaction history and USDC spent. | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) |

### Universal Client Configuration

For Claude Desktop, Cursor, or OpenCode, add the following to your configuration file (`claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "medusa-x402-security": {
      "command": "npx",
      "args": ["tsx", "/ABSOLUTE/PATH/TO/Mesh402X/mcp-server/index.ts"],
      "env": {
        "DOTENV_CONFIG_QUIET": "true",
        "ADSEC_SERVER_URL": "https://mesh402x.onrender.com"
      }
    }
  }
}
```

---

## Modular CLI Suite & Script Reference

For terminal environments, CI/CD pipelines, and automated bots, Medusa provides modular standalone scripts:

| Script Command | Endpoint | Price | Description |
|---|---|---|---|
| `npx tsx medusa-scripts/audit-score.ts <file> [threshold]` | `POST /adsec/scan` | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) | **CI/CD Security Score Gate**: Evaluates manifests and exits with code 0 (Pass) or 1 (Fail). |
| `npx tsx medusa-scripts/audit-full.ts <file>` | `POST /adsec/audit` | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) | **Full Pipeline**: AST/CVE scan, LLM semantic review, diff generation, attestation. |
| `npx tsx medusa-scripts/audit-scan.ts <file>` | `POST /adsec/scan` | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) | **Pre-Flight Scanner**: Leaked secrets, dangerous AST syntax, live OSV.dev CVEs. |
| `npx tsx medusa-scripts/audit-remediate.ts <file>` | `POST /adsec/remediate` | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) | **Auto-Remediation**: Generates language-aware `git apply` unified diff patches. |
| `npx tsx medusa-scripts/audit-attest.ts <file>` | `POST /adsec/attest` | ![Cost](https://img.shields.io/badge/$0.001_USDC-06D6A0?style=flat&logoColor=black) | **On-Chain Attestation**: Writes SHA-256 code digest & audit verdict to Algorand. |
| `npx tsx medusa-scripts/wallet-history.ts` | Algorand Indexer | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) | **Financial Ledger**: Shows transaction history, total audits bought & USDC spent. |
| `npx tsx medusa-scripts/check-wallet.ts` | Algorand Algod | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) | **Diagnostic**: Shows current ALGO gas and USDC balances + ASA opt-in status. |
| `npx tsx medusa-scripts/optin-usdc.ts` | Algorand Algod | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) | **ASA Opt-In**: Opts the agent wallet into USDC ASA #10458941. |
| `npx tsx medusa-scripts/generate-wallet.ts` | — | ![Cost](https://img.shields.io/badge/FREE-FFE600?style=flat&logoColor=black) | **Generator**: Creates a fresh Algorand keypair and mnemonic. |

---

## CI/CD Security Score Gate

Medusa parses package manifests across major ecosystems:
- **Dart / Flutter**: `pubspec.yaml`, `pubspec.lock`
- **JavaScript / TypeScript**: `package.json`
- **Python**: `requirements.txt`, `pyproject.toml`
- **Go**: `go.mod`
- **Rust**: `Cargo.toml`

### Example Usage:
```bash
# Evaluate pubspec.yaml against an 80-point minimum threshold
npx tsx medusa-scripts/audit-score.ts pubspec.yaml 80

# Output ONLY the raw score number for bash script consumption
npx tsx medusa-scripts/audit-score.ts package.json --score-only
```

### Exit Codes:
- `0`: Security score meets or exceeds the required threshold (Pipeline proceeds).
- `1`: Security score falls below the required threshold (Pipeline halts).

---

## Real-Time On-Chain Settlement Ledger

The Medusa Web Interface features an immutable, live-updating transaction ledger that queries Algorand TestNet consensus directly:

- **Public Network Feed:** Displays live incoming $0.001 USDC audit micropayments and on-chain attestation receipts in real-time with 5-second automatic polling.
- **My Receipts View:** Connects with Pera, Defly, or Kibisis wallets to display personal audit spending and cryptographic proofs.
- **Safe Note Decoder:** Parses base64 transaction notes into readable audit metadata (`x402-payment-v2-...`, `adsec:v1;sha256:...`).
- **Direct Explorer Deep-Links:** Verifies every transaction on [Algorand Lora Explorer](https://lora.algokit.io/testnet).

---

## Repository Architecture

```text
Mesh402X/
├── install.sh                             # 1-line universal installer
├── AGENTS.md                              # Autonomous Agent Instructions & Policy
├── Medusa_Skill.md                        # Master AI Agent Skill specification
├── README.md                              # Repository Documentation
├── ARCHITECTURE.md                        # Architectural specification
├── mcp-config.example.json                # Universal MCP client template
├── package.json                           # Root dependencies and scripts
│
├── mcp-server/                            # Native Model Context Protocol (MCP) Server
│   └── index.ts                           # JSON-RPC stdio server with in-process x402
│
├── medusa-scripts/                        # Modular audit and wallet scripts
│   ├── audit-score.ts                     # CI/CD Security Score Gate ($0.001 USDC)
│   ├── audit-full.ts                      # Full All-in-One Audit ($0.001 USDC)
│   ├── audit-scan.ts                      # Pre-Flight Scanner ($0.001 USDC)
│   ├── audit-remediate.ts                 # Git Diff Auto-Remediation ($0.001 USDC)
│   ├── audit-attest.ts                    # On-Chain Attestation ($0.001 USDC)
│   ├── wallet-history.ts                  # On-Chain Financial Ledger & Tx History
│   ├── check-wallet.ts                    # Wallet balance & ALGO gas diagnostic
│   ├── optin-usdc.ts                      # 1-click USDC ASA opt-in
│   └── generate-wallet.ts                 # Keypair generator
│
├── .agents/                               # Antigravity agent customizations
│   ├── mcp_config.json                    # Workspace MCP configuration
│   └── skills/medusa-audit/
│       ├── SKILL.md                       # Progressive disclosure skill file
│       └── scripts/                       # Synced modular scripts
│
└── x402-Project/
    ├── x402-demo-server/                  # Backend: Express x402 Resource Server
    │   ├── index.ts                       # Server entry, CORS, routes
    │   ├── endpoints.config.ts            # Paid routes, prices, discovery metadata
    │   ├── handlers/adsec-audit.ts        # Audit endpoint handlers
    │   └── engine/                        # Multi-ecosystem OSV, AST & LLM engine
    │
    └── X402-Usecase/projects/X402-Usecase/# Frontend: Dual-Mode React App
        └── src/
            ├── AppWithTabs.tsx            # Header & Tab Switcher
            ├── AdsecHome.tsx              # Web Playground landing & runner
            └── components/
                ├── AgentGuidePage.tsx     # Agent & Dev Guide tab
                ├── AdsecPlayground.tsx    # Code editor, controls, results
                ├── AsciiTerminal.tsx      # Live ASCII payment pipeline
                └── OnChainLedger.tsx      # Real-time on-chain receipt ledger
```

---

## License

[MIT](LICENSE)
