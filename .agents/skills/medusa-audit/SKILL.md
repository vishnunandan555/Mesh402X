---
name: medusa-security-audit
description: Discovers and hires the decentralized Medusa security node via x402 on Algorand TestNet. Inspects tiers, autonomously executes modular audit scripts, pays in TestNet USDC, and applies unified Git diff patches.
---

# 🐍 Medusa x402 Autonomous Agent Skill

This skill gives any AI agent the capability to discover, hire, pay, and consume security auditing services from the **Medusa Security Node** using the **x402 payment standard** on **Algorand TestNet**.

---

## 🧭 Service Capabilities & Tier Pricing

Medusa exposes 4 paid tiers and 1 free dev mode. All paid tiers settle in **TestNet USDC (ASA ID `10458941`)** on Algorand.

| Tier / Feature | Endpoint | Price | Modular Script to Execute | When to Choose |
|---|---|---|---|---|
| ⚡ **Pre-Flight Scanner** | `POST /adsec/scan` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-scan.ts <file>` | User asks for a fast scan, CVE check, leaked secret search, or static AST pattern analysis. |
| 🩹 **Auto-Remediation** | `POST /adsec/remediate` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-remediate.ts <file>` | User asks to fix security bugs or generate `git apply` patches. |
| ⛓️ **On-Chain Attestation** | `POST /adsec/attest` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-attest.ts <file>` | User asks for cryptographic proof-of-audit or on-chain certificate. |
| 🚀 **Full Security Suite** | `POST /adsec/audit` | **$0.001 USDC** | `npx tsx medusa-scripts/audit-full.ts <file>` | User asks for a comprehensive audit, full review, or default security check. |
| 🟢 **Free Dev Test** | `POST /adsec/dev-audit` | **$0.00** | `npx tsx medusa-scripts/audit-dev.ts <file>` | User wants a zero-token dry run or has no TestNet wallet configured. |

---

## 🧠 Autonomous Decision Matrix for the Agent

When the user asks you to review or secure their code, evaluate their request and execute the appropriate script:

1. **If the user says:** *"Run a complete audit on `auth.py`"* or *"Audit this repository"*:
   👉 Run: `npx tsx medusa-scripts/audit-full.ts <target_file>`

2. **If the user says:** *"Just scan for leaked keys or CVEs"*:
   👉 Run: `npx tsx medusa-scripts/audit-scan.ts <target_file>`

3. **If the user says:** *"Fix the vulnerabilities in `server.js`"*:
   👉 Run: `npx tsx medusa-scripts/audit-remediate.ts <target_file>`

4. **If the user says:** *"Issue an on-chain attestation for `vault.py`"*:
   👉 Run: `npx tsx medusa-scripts/audit-attest.ts <target_file>`

5. **If the user says:** *"Do a free test without spending tokens"*:
   👉 Run: `npx tsx medusa-scripts/audit-dev.ts <target_file>`

---

## 🛠️ Execution Protocol

### Step 1: Discover Target Files
- Scan the repository for source files: `.py`, `.js`, `.ts`, `.tsx`, `.sol`.
- Target the file(s) specified by the user or the highest-risk files in the repo.

### Step 2: Execute the Script in Terminal
Run the chosen script using `npx tsx`. The script will:
- Read `AGENT_MNEMONIC` from `.env`.
- Query GoPlausible Bazaar or contact the hosted Medusa Node (`https://mesh402x.onrender.com`).
- Handle the HTTP 402 challenge and sign the $0.001 USDC payment on Algorand TestNet.
- Output structured findings and save `audit.patch` if fixes were generated.

### Step 3: Self-Heal (Apply Patches)
If `audit.patch` is created and the user requested automated remediation:
```bash
git apply audit.patch
```

### Step 4: Report Findings to User
Format your final response with:
- **🛡️ Security Health Score:** `Score / 100`
- **🚨 Findings Table:** Category, Severity, CWE ID, Description, and Line Number.
- **🩹 Remediation:** Summary of patches generated or applied.
- **⛓️ On-Chain Attestation:** Direct link to [Algorand Lora Explorer](https://lora.algokit.io/testnet/transaction/<TX_ID>).

---

## 🔧 Wallet Utilities
- **Check Balance & Opt-in Status:** `npx tsx medusa-scripts/check-wallet.ts`
- **Opt-in to USDC (ASA 10458941):** `npx tsx medusa-scripts/optin-usdc.ts`
- **Generate Fresh Wallet:** `npx tsx medusa-scripts/generate-wallet.ts`
