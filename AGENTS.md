# AGENTS.MD — Autonomous Agent Instructions for Medusa x402

> **Instructions for AI Assistants (Google Antigravity, Cursor, Claude Code, GitHub Copilot) operating in this repository.**

---

## Primary Purpose & Economic Policy

Medusa is a decentralized security audit node on Algorand TestNet monetized via the **x402 payment standard**.

> **STRICT ECONOMIC POLICY: NO FREE TIERS EXIST.**
> Every audit request requires an on-chain micropayment of **$0.001 TestNet USDC (ASA #10458941)**.
> All requests must be executed using the modular scripts in `medusa-scripts/` which autonomously handle the HTTP 402 challenge and sign payments using `AGENT_MNEMONIC` from `wallet.env` or `.env`.

---

## Currency & Gas Fee Model

| Asset | Token ID / Type | Purpose | Amount Per Call | Faucet / Dispenser Link |
|---|---|---|---|---|
| **ALGO** | Native Algorand Token | Blockchain Transaction Gas Fee | **0.001 ALGO** | [Lora TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) |
| **USDC** | ASA ID `#10458941` | Medusa Security Audit Fee | **$0.001 USDC** (1,000 microUSDC) | [Circle USDC Faucet](https://faucet.circle.com) |

---

## Modular Scripts & Capabilities

| Script | Endpoint | Price | Function |
|---|---|---|---|
| `npx tsx medusa-scripts/audit-full.ts <file>` | `POST /adsec/audit` | **$0.001 USDC** | Full All-in-One: AST/CVE Scan + LLM Deep Review + Git Diffs + Attestation |
| `npx tsx medusa-scripts/audit-scan.ts <file>` | `POST /adsec/scan` | **$0.001 USDC** | Pre-Flight Scanner: Leaked secrets, dangerous AST syntax & live OSV.dev CVEs |
| `npx tsx medusa-scripts/audit-remediate.ts <file>` | `POST /adsec/remediate` | **$0.001 USDC** | Auto-Remediation: Generates language-aware `git apply` unified diff patches |
| `npx tsx medusa-scripts/audit-attest.ts <file>` | `POST /adsec/attest` | **$0.001 USDC** | On-Chain Attestation: Writes SHA-256 code digest & audit verdict to Algorand |
| `npx tsx medusa-scripts/wallet-history.ts` | Algorand Indexer | **$0.00** | Financial Ledger: Shows transaction history, total audits bought & USDC spent |
| `npx tsx medusa-scripts/check-wallet.ts` | Algorand Algod | **$0.00** | Diagnostic: Shows current ALGO gas and USDC balances + ASA opt-in status |
| `npx tsx medusa-scripts/optin-usdc.ts` | Algorand Algod | **$0.00** | ASA Opt-In: Opts the agent wallet into USDC ASA #10458941 |
| `npx tsx medusa-scripts/generate-wallet.ts` | — | **$0.00** | Generator: Creates a fresh Algorand keypair and mnemonic |

---

## Mnemonic Sanitization

All `medusa-scripts/` automatically sanitize `AGENT_MNEMONIC` loaded from `wallet.env` or `.env`.
They automatically strip assignment prefixes (e.g. `AGENT_MNEMONIC = ...`), double quotes (`"`), single quotes (`'`), backslashes (`\`), and leading/trailing whitespace.

---

## Agent Output Requirements & Financial Spending Summary

Whenever you perform a security audit for the user, you **MUST** include the following sections in your final report:

1. **Security Health Score:** Output the overall score (`0–100/100`).
2. **Detected Vulnerabilities:** List CWE ID, file name, line numbers, and vulnerability descriptions.
3. **Remediation:** Apply or present the generated unified Git diff patch (`git apply audit.patch`).
4. **Financial Spending Summary (MANDATORY):**
   - **Cost of Current Call:** `$0.001 USDC (1,000 microUSDC)`
   - **Network Gas Fee:** `0.001 ALGO`
   - **Receiver Node Account:** `LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`
   - **Payment Protocol:** `x402 (Algorand TestNet ASA #10458941)`
   - **Settlement Transaction ID:** `<TX_ID>`
5. **On-Chain Verification:** Provide the direct [Algorand Lora Explorer Link](https://lora.algokit.io/testnet/transaction/<TX_ID>).

---

## Checking Financial History & Diagnostic

If the user asks:
- *"How much money did I spend on audits?"*
- *"Show my past transaction history"*
- *"What is my remaining balance?"*

-> Execute: `npx tsx medusa-scripts/wallet-history.ts` or `npx tsx medusa-scripts/check-wallet.ts`
And present the summary table, remaining USDC budget, and ALGO gas level to the user.
