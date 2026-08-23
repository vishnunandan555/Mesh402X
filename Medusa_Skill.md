---
name: medusa-security-audit
description: Discovers and hires the decentralized Medusa security node via x402 on Algorand TestNet. Inspects tiers, autonomously executes modular audit scripts, pays in TestNet USDC, reports financial spending summaries, and applies unified Git diff patches.
---

# Medusa x402 Autonomous Agent Skill

This skill gives any AI agent the capability to discover, hire, pay, and consume security auditing services from the **Medusa Security Node** using the **x402 payment standard** on **Algorand TestNet**.

> **STRICT ECONOMIC POLICY: NO FREE TIERS EXIST.**
> Medusa operates on a 100% pay-per-call economic model. Every request requires an on-chain micropayment of **$0.001 TestNet USDC (ASA ID 10458941)**.

---

## Service Capabilities & Tier Pricing

| Tier / Feature | Endpoint | Price | Modular Script to Execute | When to Choose |
|---|---|---|---|---|
| **Pre-Flight Scanner** | `POST /adsec/scan` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-scan.ts <file>` | Fast scan for leaked secrets, dangerous AST patterns, typosquatting packages, or live OSV.dev CVEs. |
| **Auto-Remediation** | `POST /adsec/remediate` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-remediate.ts <file>` | Automatically generate language-aware `git apply` unified diff patches to fix vulnerabilities. |
| **On-Chain Attestation** | `POST /adsec/attest` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-attest.ts <file>` | Compute SHA-256 code digest and broadcast an immutable proof-of-audit certificate on Algorand. |
| **Full Security Suite** | `POST /adsec/audit` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-full.ts <file>` | Comprehensive review: Scan + LLM Logic Review + Git Diffs + On-Chain Attestation. |
| **Financial Ledger & History** | — | **$0.00** | `npx tsx medusa-scripts/wallet-history.ts` | User asks to check past transactions, total audits purchased, or financial spending summary. |

---

## Autonomous Decision Matrix for the Agent

When the user asks you to review or secure code, evaluate their request and execute the appropriate script:

1. **If the user says:** *"Run a complete audit on `auth.py`"* or *"Audit this repository"*:
   -> Run: `npx tsx medusa-scripts/audit-full.ts <target_file>`

2. **If the user says:** *"Just scan for leaked keys or CVEs"*:
   -> Run: `npx tsx medusa-scripts/audit-scan.ts <target_file>`

3. **If the user says:** *"Fix the vulnerabilities in `server.js`"*:
   -> Run: `npx tsx medusa-scripts/audit-remediate.ts <target_file>`

4. **If the user says:** *"Issue an on-chain attestation for `vault.py`"*:
   -> Run: `npx tsx medusa-scripts/audit-attest.ts <target_file>`

5. **If the user asks:** *"How much have I spent?"* or *"Show my transaction history"*:
   -> Run: `npx tsx medusa-scripts/wallet-history.ts`

---

## Execution Protocol

### Step 1: Discover Target Files
- Scan the repository for source files: `.py`, `.js`, `.ts`, `.tsx`, `.sol`.
- Target the file(s) specified by the user or the highest-risk files in the repo.

### Step 2: Execute the Script in Terminal
Run the chosen script using `npx tsx`. The script will:
- Read `AGENT_MNEMONIC` from `wallet.env` or `.env`.
- Query GoPlausible Bazaar or contact the hosted Medusa Node (`https://mesh402x.onrender.com`).
- Handle the HTTP 402 challenge and sign the $0.001 USDC payment on Algorand TestNet.
- Echo payment confirmation and output structured findings + Git diffs.

### Step 3: Self-Heal (Apply Patches)
If `audit.patch` is created and the user requested automated remediation:
```bash
git apply audit.patch
```

### Step 4: Report Findings & Financial Spending Summary to User
Format your final response with:
- **Security Health Score:** `Score / 100`
- **Findings Table:** Category, Severity, CWE ID, Description, and Line Number.
- **Remediation:** Summary of patches generated or applied.
- **Financial Spending Summary (MANDATORY):**
  - **Amount Paid:** `$0.001 USDC (1,000 microUSDC)`
  - **Receiver Node:** `LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`
  - **Payment Protocol:** `x402 (Algorand TestNet ASA #10458941)`
  - **Settlement TxID:** `<TX_ID>`
- **On-Chain Attestation Proof:** Direct link to [Algorand Lora Explorer](https://lora.algokit.io/testnet/transaction/<TX_ID>).

---

## Wallet & Financial Utilities
- **Transaction History & Spending Summary:** `npx tsx medusa-scripts/wallet-history.ts`
- **Check Balance & Opt-in Status:** `npx tsx medusa-scripts/check-wallet.ts`
- **Opt-in to USDC (ASA 10458941):** `npx tsx medusa-scripts/optin-usdc.ts`
- **Generate Fresh Wallet:** `npx tsx medusa-scripts/generate-wallet.ts`
