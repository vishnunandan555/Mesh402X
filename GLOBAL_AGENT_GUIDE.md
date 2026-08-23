# 🤖 Medusa Global Autonomous AI Agent Guide

> **How any developer or AI agent worldwide can discover, hire, pay, and receive security audits from Medusa via x402 on Algorand TestNet.**

---

## ⚡ 1-Line Universal Setup in Any External Repository

Run this single command inside any codebase:

```bash
curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
```

**This automatically:**
1. Installs `@x402-avm/fetch` & `algosdk`.
2. Sets up your agent's Algorand wallet in `.env`.
3. Downloads the modular `medusa-scripts/` suite.
4. Configures `Medusa_Skill.md` so that AI agents (Antigravity, Cursor, Claude Code) understand Medusa natively.

---

## 💎 Modular Tiers & Pricing ($0.001 USDC / call)

| Tier / Feature | Endpoint | Price | Modular Script to Execute | When to Choose |
|---|---|---|---|---|
| ⚡ **Pre-Flight Scanner** | `POST /adsec/scan` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-scan.ts <file>` | Fast scan, CVE check, leaked secrets, AST patterns. |
| 🩹 **Auto-Remediator** | `POST /adsec/remediate` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-remediate.ts <file>` | Generate language-aware `git apply` patches. |
| ⛓️ **On-Chain Attestation** | `POST /adsec/attest` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-attest.ts <file>` | Cryptographic SHA-256 on-chain proof on Algorand. |
| 🚀 **Full Security Suite** | `POST /adsec/audit` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-full.ts <file>` | Complete pipeline: Scan + AI Review + Diffs + Attestation. |
| 🟢 **Free Dev Test** | `POST /adsec/dev-audit` | **$0.00** | `npx tsx medusa-scripts/audit-dev.ts <file>` | Zero-token rapid testing without wallet funds. |

---

## 💬 Prompting Your AI Assistant in Plain English

Once installed, simply type into your AI assistant chat (Antigravity, Cursor, Claude Code):

> 💬 *"Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof."*

### What happens autonomously under the hood:
```
1. 🤖 Agent reads source code file.
2. 🌐 Discovers the Medusa Security Node on GoPlausible Bazaar.
3. ⚡ Sends request ➔ Receives HTTP 402 Payment Required ($0.001 USDC challenge).
4. ✍️ Programmatically signs 1,000 micro-USDC ASA transfer using local AGENT_MNEMONIC.
5. ⛓️ GoPlausible Facilitator settles the transaction on Algorand TestNet (~1.5s).
6. 📜 Receives:
   - Security Health Score (0-100)
   - Detailed AST & Typosquatting Vulnerabilities (with CWE IDs)
   - Cryptographic Proof-of-Audit on-chain certificate
   - Actionable Git Diff patch saved directly to 'audit.patch'
7. 🩹 Self-heals by running `git apply audit.patch`
```

---

## 🔧 Wallet Diagnostic & Management Scripts

- **Check Balance & Opt-in Status:**
  ```bash
  npx tsx medusa-scripts/check-wallet.ts
  ```
- **Opt-in to USDC (ASA #10458941):**
  ```bash
  npx tsx medusa-scripts/optin-usdc.ts
  ```
- **Generate Fresh Wallet:**
  ```bash
  npx tsx medusa-scripts/generate-wallet.ts
  ```

---

## 🌐 Dynamic Discovery via the GoPlausible Bazaar

Any external autonomous agent can dynamically discover this service from the decentralized catalog:

```bash
curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000"
```

---

## 🔍 On-Chain Verification on Lora Explorer
Every payment and on-chain attestation is publicly verifiable on Algorand TestNet:
- **Lora Explorer Root:** [https://lora.algokit.io/testnet](https://lora.algokit.io/testnet)
- **Direct Transaction Link:** `https://lora.algokit.io/testnet/transaction/<TRANSACTION_ID>`
- **Medusa Receiver Account:** [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ)
