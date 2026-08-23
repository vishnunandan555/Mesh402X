# 🤖 Global Autonomous AI Agent Guide

> **How any developer or AI agent worldwide can discover, hire, pay, and receive security audits from ADSEC via x402 on Algorand TestNet.**

---

## 🚀 3-Step Quickstart for External Users & Agents

### Step 1: Create & Fund Your Agent Wallet (10 seconds)
You do not need to create an account, register an email, or generate an API key.

1. **Generate a fresh Algorand TestNet wallet:**
   ```bash
   cd x402-Project/x402-demo-server
   npx tsx scripts/run-user-agent.ts --generate-wallet
   ```
2. **Fund your new wallet with free TestNet tokens:**
   - **ALGO (for gas):** [Algorand TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) (~5 ALGO)
   - **USDC (for micro-payments):** [Circle TestNet Faucet](https://faucet.circle.com) (Select *Algorand TestNet*, ASA `10458941`, ~10 USDC)
3. **Set your mnemonic in `.env`:**
   ```ini
   USER_AGENT_MNEMONIC="word1 word2 word3 ... word25"
   ```

---

### Step 2: Run the Autonomous Agent Against ADSEC
Run the agent CLI to audit any local source file (Python, TypeScript, JavaScript, Solidity, etc.):

```bash
# Audit a specific code file against your live Render backend
npm run agent ../../test-files/vulnerable.py -- --backend https://<YOUR_RENDER_URL>.onrender.com
```

#### What happens autonomously under the hood:
```
1. 🤖 Agent reads source code file.
2. 🌐 Discovers the ADSEC Security Node and endpoint (/adsec/audit).
3. ⚡ Sends request ➔ Receives HTTP 402 Payment Required ($0.05 USDC challenge).
4. ✍️ Programmatically signs 50,000 micro-USDC ASA transfer using local wallet key.
5. ⛓️ GoPlausible Facilitator settles the transaction on Algorand TestNet.
6. 📜 Receives:
   - Security Health Score (0-100)
   - Detailed AST & Typosquatting Vulnerabilities
   - Cryptographic Proof-of-Audit on-chain certificate
   - Actionable Git Diff patch saved directly to 'audit.patch'
```

---

### Step 3: Automatically Apply the Returned Security Patch
Your agent or CI/CD runner can immediately apply the verified fixes:

```bash
git apply audit.patch
```

---

## 🌐 Dynamic Discovery via the GoPlausible Bazaar

Any external autonomous agent can dynamically discover this service from the decentralized catalog:

```bash
curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true"
```

The catalog returns the full OpenAPI schema, pricing ($0.01 – $0.05 USDC), and parameters for:
- `POST /adsec/scan` ($0.01 USDC) — Pre-flight deterministic secret, CVE, and typosquatting scanner.
- `POST /adsec/remediate` ($0.03 USDC) — Unified Git diff auto-remediation patch generator.
- `POST /adsec/attest` ($0.01 USDC) — Cryptographic on-chain proof-of-audit certificate.
- `POST /adsec/audit` ($0.05 USDC) — Full all-in-one security audit suite.

---

## 🔍 On-Chain Verification on Lora Explorer
Every payment and on-chain attestation is publicly verifiable on Algorand TestNet:
- **Lora Explorer Root:** [https://lora.algokit.io/testnet](https://lora.algokit.io/testnet)
- **Direct Transaction Link:** `https://lora.algokit.io/testnet/transaction/<TRANSACTION_ID>`
- **ADSEC Receiver Node Ledger:** [https://lora.algokit.io/testnet/account/BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI](https://lora.algokit.io/testnet/account/BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI)
