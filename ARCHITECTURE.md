# MEDUSA (ADSEC) — Architecture & Technical Specification

---

## 1. System Architecture Overview

Medusa is structured into five decoupled layers serving autonomous AI agents, CI/CD pipelines, and web developers:

```text
+------------------------------------------------------------------------+
|                          1. CLIENT / AGENT LAYER                       |
|  * Autonomous AI Agents (Antigravity CLI agy, Cursor, OpenCode, Claude)|
|  * CI/CD Security Score Gates (GitHub Actions, GitLab CI)             |
|  * Web Application Users (Dual-Mode React UI + Pera / Defly Wallet)    |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                   2. MCP & PROTOCOL CLIENT BRIDGE                      |
|  * Native Model Context Protocol (MCP) Server (mcp-server/index.ts)    |
|  * Modular Headless Scripts (medusa-scripts/)                          |
|  * In-Process Algorand Key Management & Exact-AVM Transaction Signer   |
|  * Automatic HTTP 402 Negotiation & Payment Submission                 |
+-----------------------------------+------------------------------------+
                                    | HTTP Requests (x402 Protocol)
                                    v
+------------------------------------------------------------------------+
|                        3. X402 PROTOCOL GATEWAY                        |
|  * Express / Hono HTTP Framework (TypeScript, Edge-Ready)              |
|  * x402 Payment Middleware (Enforces HTTP 402 Challenges)              |
|  * GoPlausible Facilitator Settlement (facilitator.goplausible.xyz)     |
|  * Algorand TestNet Consensus (USDC ASA 10458941)                       |
|  * GoPlausible Bazaar Dynamic Resource Discovery Catalog               |
+-----------------------------------+------------------------------------+
                                    | Verified Paid Requests ($0.001 USDC)
                                    v
+------------------------------------------------------------------------+
|                      4. MULTI-TIER SECURITY ENGINE                     |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  | Tier 1: Deterministic Engine (<50ms)                             |  |
|  | * Secret Scanner: AWS, OpenAI, GitHub PAT, JWT, Private Keys     |  |
|  | * Dangerous Syntax: eval(), exec(), pickle, SQLi, Command Inj    |  |
|  | * Supply Chain: Typosquatting detection via Levenshtein distance |  |
|  | * Multi-Ecosystem OSV.dev CVE Query (npm, PyPI, Pub, Go, Cargo)  |  |
|  +------------------------------------------------------------------+  |
|  +------------------------------------------------------------------+  |
|  | Tier 2: AI Semantic Logic & Diff Engine                          |  |
|  | * LLM Semantic Review: Auth bypass, IDOR, business logic flaws   |  |
|  | * Unified Diff Generator: Language-aware Git patch creation       |  |
|  | * CI/CD Scorer: 0-100 Health score calculation & threshold gate   |  |
|  +------------------------------------------------------------------+  |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                      5. SETTLEMENT & AUDIT RECEIPTS                    |
|  * On-Chain Algorand TestNet Transaction Hash (Immutable Proof)        |
|  * Cryptographic SHA-256 Code Digest Attestation Notes                 |
|  * Real-Time Streamed Public On-Chain Ledger & Telemetry               |
|  * Algorand Lora Explorer Verification Deep-Links                      |
+------------------------------------------------------------------------+
```

---

## 2. Token & Gas Fee Model

| Asset | Type | Purpose | Amount Per Call | Faucet / Dispenser Link |
|---|---|---|---|---|
| ALGO | Native Algorand Token | Network Transaction Gas Fee | 0.001 ALGO / tx | [Lora TestNet Dispenser](https://lora.algokit.io/testnet/dispenser) |
| USDC | ASA ID #10458941 | Medusa Security Audit Fee | $0.001 USDC / call | [Circle USDC Faucet](https://faucet.circle.com) |

---

## 3. Endpoints & Modular Capabilities

All paid tiers settle in **TestNet USDC (ASA #10458941)** on Algorand at **$0.001 USDC (1,000 microUSDC)**.

| Endpoint | Method | Price | Modular Script / MCP Tool | Description |
|---|---|---|---|---|
| `/adsec/scan` | `POST` | $0.001 USDC | `audit-score.ts` / `medusa_get_security_score` | CI/CD Security Gate: Parses package manifests and exits 0 (Pass) or 1 (Fail). |
| `/adsec/scan` | `POST` | $0.001 USDC | `audit-scan.ts` / `medusa_scan_code` | Fast pre-flight deterministic secret, CVE, and AST vulnerability scan. |
| `/adsec/remediate` | `POST` | $0.001 USDC | `audit-remediate.ts` / `medusa_remediate_file` | Generates language-aware unified Git diff patches (`git apply` compatible). |
| `/adsec/attest` | `POST` | $0.001 USDC | `audit-attest.ts` / `medusa_attest_code` | Computes SHA-256 code hash and broadcasts on-chain Algorand certificate. |
| `/adsec/audit` | `POST` | $0.001 USDC | `audit-full.ts` / `medusa_audit_file` | Complete pipeline: Scan + AI Review + Unified Diffs + Attestation. |
| Dynamic Discovery | `GET` | $0.00 | `medusa_discover_nodes` | Queries GoPlausible Bazaar catalog for live active security nodes. |
| Financial History | — | $0.00 | `wallet-history.ts` / `medusa_get_financial_ledger` | On-chain ledger explorer: shows transaction history and USDC spent. |
| Wallet Diagnostic | — | $0.00 | `check-wallet.ts` / `medusa_check_wallet` | Checks current ALGO gas balance, USDC balance, and ASA opt-in status. |

---

## 4. Multi-Ecosystem OSV.dev Integration

The Tier 1 scanner dynamically parses package dependencies across five package formats:
- **Dart / Flutter:** `pubspec.yaml`, `pubspec.lock` (Ecosystem: `Pub`)
- **JavaScript / TypeScript:** `package.json` (Ecosystem: `npm`)
- **Python:** `requirements.txt`, `pyproject.toml` (Ecosystem: `PyPI`)
- **Go:** `go.mod` (Ecosystem: `Go`)
- **Rust:** `Cargo.toml` (Ecosystem: `crates.io`)

Queries to `https://api.osv.dev/v1/query` are executed concurrently with timeouts, returning precise CVE aliases (`CVE-YYYY-NNNN`), CWE IDs, affected versions, and severity ratings.

---

## 5. On-Chain Attestation Standard

When `/adsec/attest` is invoked, Medusa calculates the SHA-256 digest of the audited code and constructs a standard Algorand note field payload:

```text
adsec:v1;sha256=<HASH>;score=<SCORE>;status=<VERDICT>
```

This 0-ALGO transaction is broadcasted to Algorand TestNet consensus, establishing an immutable timestamp and proof-of-audit certificate verifiable on any Algorand block explorer.
