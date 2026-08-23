# AGENTS.MD — Autonomous Agent Instructions for Medusa x402

Instructions for AI Assistants (Google Antigravity, Cursor, Claude Code, GitHub Copilot) operating in this repository.

---

## Primary Purpose & Economic Policy

Medusa is a decentralized security audit node on Algorand TestNet monetized via the **x402 payment standard**.

STRICT ECONOMIC POLICY: NO FREE TIERS EXIST.
Every audit request requires an on-chain micropayment of **$0.001 TestNet USDC (ASA #10458941)**.
All requests must be executed using the native MCP tools (`mcp-server/index.ts`) or modular scripts in `medusa-scripts/` which autonomously handle the HTTP 402 challenge and sign payments using `AGENT_MNEMONIC` from `wallet.env` or `.env`.

---

## Currency & Gas Fee Model

| Asset | Token ID / Type | Purpose | Amount Per Call | Faucet / Dispenser Link |
|---|---|---|---|---|
| ALGO | Native Algorand Token | Blockchain Transaction Gas Fee | 0.001 ALGO | [Lora TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) |
| USDC | ASA ID #10458941 | Medusa Security Audit Fee | $0.001 USDC (1,000 microUSDC) | [Circle USDC Faucet](https://faucet.circle.com) |

---

## Capabilities, MCP Tools & Modular Scripts

| Capability | Price | Native MCP Tool | Modular CLI Script | Function |
|---|---|---|---|---|
| CI/CD Security Gate | $0.001 USDC | `medusa_get_security_score` | `npx tsx medusa-scripts/audit-score.ts <file> [minScore]` | Calculates 0-100 score on code/manifests and evaluates pass/fail CI/CD gate. |
| Full Audit Pipeline | $0.001 USDC | `medusa_audit_file` | `npx tsx medusa-scripts/audit-full.ts <file>` | AST/CVE scan + LLM Deep Review + Git Diffs + Attestation. |
| Pre-Flight Scanner | $0.001 USDC | `medusa_scan_code` | `npx tsx medusa-scripts/audit-scan.ts <file>` | Leaked secrets, dangerous AST syntax & live OSV.dev CVEs. |
| Auto-Remediation | $0.001 USDC | `medusa_remediate_file` | `npx tsx medusa-scripts/audit-remediate.ts <file>` | Generates language-aware `git apply` unified diff patches. |
| On-Chain Attestation | $0.001 USDC | `medusa_attest_code` | `npx tsx medusa-scripts/audit-attest.ts <file>` | Writes SHA-256 code digest & audit verdict to Algorand. |
| Bazaar Discovery | $0.00 | `medusa_discover_nodes` | — | Dynamic catalog discovery on GoPlausible Bazaar. |
| Financial Ledger | $0.00 | `medusa_get_financial_ledger` | `npx tsx medusa-scripts/wallet-history.ts` | Shows transaction history, total audits bought & USDC spent. |
| Wallet Diagnostic | $0.00 | `medusa_check_wallet` | `npx tsx medusa-scripts/check-wallet.ts` | Shows current ALGO gas and USDC balances + ASA opt-in status. |
| ASA Opt-In | $0.00 | — | `npx tsx medusa-scripts/optin-usdc.ts` | Opts the agent wallet into USDC ASA #10458941. |
| Keypair Generator | $0.00 | — | `npx tsx medusa-scripts/generate-wallet.ts` | Creates a fresh Algorand keypair and mnemonic. |

---

## Mnemonic Sanitization

All `medusa-scripts/` and the MCP server automatically sanitize `AGENT_MNEMONIC` loaded from `wallet.env` or `.env`.
They automatically strip assignment prefixes (e.g. `AGENT_MNEMONIC = ...`), double quotes (`"`), single quotes (`'`), backslashes (`\`), and leading/trailing whitespace.

---

## Agent Output Requirements & Financial Spending Summary

Whenever you perform a security audit for the user, you MUST include the following sections in your final report:

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
- "How much money did I spend on audits?"
- "Show my past transaction history"
- "What is my remaining balance?"

Execute: `medusa_get_financial_ledger` or `npx tsx medusa-scripts/wallet-history.ts` / `check-wallet.ts`
And present the summary table, remaining USDC budget, and ALGO gas level to the user.
