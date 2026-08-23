---
name: medusa-security-audit
description: Discovers and hires the decentralized Medusa security node via x402 on Algorand TestNet. Native MCP tool calls or autonomous CLI scripts, pays in TestNet USDC, reports financial spending summaries, and applies unified Git diff patches.
---

# Medusa x402 Autonomous Agent Skill & Native MCP Server

This skill gives any AI agent (Antigravity CLI `agy`, OpenCode, Claude Desktop, Cursor) the capability to discover, hire, pay, and consume security auditing services from the **Medusa Security Node** using the **x402 payment standard** on **Algorand TestNet**.

> **STRICT ECONOMIC POLICY: NO FREE TIERS EXIST.**
> Medusa operates on a 100% pay-per-call economic model. Every request requires an on-chain micropayment of **$0.001 TestNet USDC (ASA ID 10458941)**.

---

## Token & Gas Fee Model

| Asset | Type | Role | Cost | Faucet / Dispenser Link |
|---|---|---|---|---|
| **ALGO** | Native Algorand Token | Network Gas Fee | **0.001 ALGO** / tx | [Lora TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) |
| **USDC** | ASA ID `#10458941` | Audit Service Fee | **$0.001 USDC** / call | [Circle USDC Faucet](https://faucet.circle.com) |

---

## Service Capabilities & Execution Options

You can invoke Medusa either via **Native MCP Tools** (preferred in Antigravity / Claude / Cursor) or via **Modular CLI Scripts**:

| Tier / Feature | Price | Native MCP Tool (Preferred) | Modular CLI Script Fallback | When to Choose |
|---|---|---|---|---|
| **CI/CD Security Scorer** | **$0.001 USDC** | `medusa_get_security_score(filePath, minScoreThreshold)` | `npx tsx medusa-scripts/audit-score.ts <file> [threshold]` | Calculates 0-100 score on manifests/imports (pubspec.yaml, package.json, requirements.txt) and blocks CI/CD if below threshold. |
| **Full Security Suite** | **$0.001 USDC** | `medusa_audit_file(filePath, applyRemediation)` | `npx tsx medusa-scripts/audit-full.ts <file>` | Comprehensive review: Scan + LLM Logic Review + Git Diffs + On-Chain Attestation. |
| **Pre-Flight Scanner** | **$0.001 USDC** | `medusa_scan_code(filePath)` | `npx tsx medusa-scripts/audit-scan.ts <file>` | Fast scan for leaked secrets, dangerous AST patterns, typosquatting packages, or live OSV.dev CVEs. |
| **Auto-Remediation** | **$0.001 USDC** | `medusa_remediate_file(filePath, applyPatch)` | `npx tsx medusa-scripts/audit-remediate.ts <file>` | Automatically generate language-aware `git apply` unified diff patches to fix vulnerabilities. |
| **On-Chain Attestation** | **$0.001 USDC** | `medusa_attest_code(filePath, score)` | `npx tsx medusa-scripts/audit-attest.ts <file>` | Compute SHA-256 code digest and broadcast an immutable proof-of-audit certificate on Algorand. |
| **Bazaar Node Discovery** | **$0.00** | `medusa_discover_nodes(limit)` | — | Discovers active security nodes and rates on GoPlausible Bazaar. |
| **Financial Ledger & History** | **$0.00** | `medusa_get_financial_ledger(limit)` | `npx tsx medusa-scripts/wallet-history.ts` | Check past transactions, total audits purchased, and financial spending summary. |
| **Wallet Diagnostics** | **$0.00** | `medusa_check_wallet()` | `npx tsx medusa-scripts/check-wallet.ts` | Check ALGO gas balance, USDC balance, and ASA opt-in status. |

---

## Autonomous Decision Matrix for the Agent

When the user asks you to review or secure code, evaluate their request and choose the appropriate action:

1. **If the user says:** *"Run a complete audit on `auth.py`"* or *"Audit this repository"*:
   - MCP: Call `medusa_audit_file({ filePath: "auth.py", applyRemediation: true })`
   - CLI: Run `npx tsx medusa-scripts/audit-full.ts auth.py`

2. **If the user says:** *"Just scan for leaked keys or CVEs"*:
   - MCP: Call `medusa_scan_code({ filePath: "target.js" })`
   - CLI: Run `npx tsx medusa-scripts/audit-scan.ts target.js`

3. **If the user says:** *"Fix the vulnerabilities in `server.js`"*:
   - MCP: Call `medusa_remediate_file({ filePath: "server.js", applyPatch: true })`
   - CLI: Run `npx tsx medusa-scripts/audit-remediate.ts server.js`

4. **If the user says:** *"Issue an on-chain attestation for `vault.py`"*:
   - MCP: Call `medusa_attest_code({ filePath: "vault.py" })`
   - CLI: Run `npx tsx medusa-scripts/audit-attest.ts vault.py`

5. **If the user asks:** *"How much have I spent?"* or *"Show my transaction history"*:
   - MCP: Call `medusa_get_financial_ledger({})`
   - CLI: Run `npx tsx medusa-scripts/wallet-history.ts`

6. **If the user asks:** *"Do I have enough balance or ALGO?"*:
   - MCP: Call `medusa_check_wallet()`
   - CLI: Run `npx tsx medusa-scripts/check-wallet.ts`

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
