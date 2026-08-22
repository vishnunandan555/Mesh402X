# 🛡️ ADSEC — Complete Product & Enterprise Feature Specification

> **ADSEC (Autonomous Decentralized Security Audit Service)**  
> Production-Grade Security Infrastructure & Pre-Flight Gatekeeper for AI Agents on Algorand x402

---

## 🏛️ 1. The 3-Endpoint Agentic Pipeline (3 Green Cards Architecture)

ADSEC is architected as a modular, 3-stage agentic security pipeline. Each endpoint solves a distinct computational bottleneck, allowing autonomous AI agents to pay only for the exact level of analysis they need:

```mermaid
flowchart LR
    A["🤖 AI Agent / Developer Code"] --> B["🟢 Endpoint 1: POST /adsec/scan\n($0.01 USDC)\nPre-Flight Scanner"]
    B -->|Issues Found| C["🟢 Endpoint 2: POST /adsec/remediate\n($0.03 USDC)\nGit Diff Patch Engine"]
    B -->|Clean / Patched| D["🟢 Endpoint 3: POST /adsec/attest\n($0.01 USDC)\nOn-Chain Attestation"]
    C --> D
    
    subgraph Unified["⚡ All-In-One Node"]
        E["POST /adsec/audit ($0.05 USDC)\nFull Pipeline (Scan + Diff + Attest)"]
    end
```

### 📋 The 3 Modular x402 Endpoints:

| Endpoint | Path | Price (USDC) | Function & Purpose | Output |
| :--- | :--- | :---: | :--- | :--- |
| **🟢 Endpoint 1** | `POST /adsec/scan` | **$0.01** | **Deterministic Pre-Flight Scanner:** Regex secrets, AST dangerous patterns, package typosquatting & live OSV.dev CVE correlation. | Severity Score (0-100), Categorized Findings, Line Numbers. |
| **🟢 Endpoint 2** | `POST /adsec/remediate` | **$0.03** | **Automated Patch Generator:** Generates language-aware, unified Git diff patches (`--- a/ +++ b/`) ready for `git apply`. | Machine-readable unified Git diffs + explanations. |
| **🟢 Endpoint 3** | `POST /adsec/attest` | **$0.01** | **On-Chain Attestation Issuer:** Computes SHA-256 code hash and writes cryptographic audit proof into Algorand TestNet `tx_note`. | Confirmed Algorand TxID + Lora Explorer URL. |
| **⚡ Unified Suite** | `POST /adsec/audit` | **$0.05** | **Complete All-in-One Audit:** Runs all 3 stages in a single HTTP request. | Full Audit Report + Git Diffs + On-Chain Proof. |

---

## 💼 2. Why Companies, Developers & AI Agents Pay for ADSEC

### 💰 2.1 The Economic Math: Compute & Token Cost Savings

| Metric | Running Security Audits via General LLM | Running via ADSEC on Algorand |
| :--- | :---: | :---: |
| **Context Window Overhead** | 4,000 – 12,000 tokens ($0.08 – $0.25 per run) | **0 tokens ($0.00 token cost)** |
| **Execution Latency** | 8 – 20 seconds | **< 800 milliseconds** |
| **Per-Audit Cost** | ~$0.15 (API token billing) | **$0.01 – $0.05 USDC (Micro-payment)** |
| **CVE Intelligence** | Stale (Trained on historical data cutoff) | **Live (Real-time OSV.dev feeds)** |
| **Output Format** | Conversational prose (Hard to parse) | **Standard unified Git diffs (`git apply`)** |
| **Proof of Audit** | None | **Verifiable on Algorand TestNet (`tx_note`)** |

> **Key Takeaway:** For a software company or autonomous agent running 1,000 pre-commit code checks daily, **ADSEC cuts latency by 90% and compute cost by over 80%** while providing real-time CVE intelligence and on-chain audit receipts.

---

## 🛡️ 3. Comprehensive Feature Catalog

### 🔍 3.1 Tier 1: Deterministic Static Analysis & Threat Feeds
1. **High-Entropy Secret & Credential Scanner:**
   * Detects exposed AWS Access Keys (`AKIA...`), OpenAI API keys (`sk-...`), GitHub PATs (`ghp_...`), JWTs, and private key blocks (`-----BEGIN PRIVATE KEY-----`).
   * Automatically sanitizes token previews (e.g. `sk-p***890`) to prevent secondary leak hazards.
2. **Dangerous Syntax & AST Pattern Detector:**
   * **Python:** SQL injection in dynamic string formatting, `eval()`, `exec()`, unsafe `pickle.loads()` deserialization, and command injection (`os.system`).
   * **JavaScript / TypeScript:** `dangerouslySetInnerHTML`, `eval()`, `new Function()`, prototype pollution, and ReDoS.
   * **Solidity:** `tx.origin` authentication vulnerabilities and reentrancy hazards.
3. **Supply-Chain Package Typosquatting Checker:**
   * Computes Levenshtein edit distance against top 500 popular npm/PyPI libraries to catch malicious dependency spoofing (e.g. `reqeusts` vs `requests`).
   * Built-in whitelist for Node/Python standard library modules (`os`, `sys`, `fs`, `path`).
4. **Live OSV.dev CVE Database Correlation:**
   * Queries real-time vulnerability records from `api.osv.dev`.
   * **Line-Level Caller Correlation:** Links CVE records directly to the line of code where the vulnerable module or function is invoked.

### 🧠 3.2 Tier 2: AI Logic Review & Language-Aware Auto-Remediation
1. **Language-Aware Unified Git Diff Patch Generator:**
   * Generates standard unified diffs (`--- a/file +++ b/file`) that agents can apply immediately with `git apply`.
   * Adapts replacements to target language: `os.environ.get()` for Python, `process.env` for JS/TS.
2. **Multi-Provider LLM Fallback Cascade:**
   * **Groq (Llama-3.3-70B):** Blazing-fast inference in <300ms.
   * **Google Gemini (1.5 Flash):** Deep reasoning on complex logic bugs.
   * **OpenAI (GPT-4o-mini):** Fallback provider.
   * **Offline Graceful Engine:** Falls back to local deterministic diff generator if no API keys are configured.

### ⛓️ 3.3 Algorand-Native Security & Smart Contract Shield
1. **Algorand PyTeAL / AlgoKit AST Rules:**
   * **Missing ASA Opt-In Checks:** Detects missing opt-in verifications before attempting ASA transfers (the #1 Algorand developer bug).
   * **Inner Transaction (`itxn`) Safety:** Catches unchecked fee overflows and unvetted asset transfers.
   * **Rekeying Authorization Exploits:** Flags unprotected `rekey_to` operations.
2. **On-Chain Cryptographic Proof-of-Audit:**
   * Hashes the audited code (SHA-256) and logs the hash, timestamp, and audit score directly into the **Algorand transaction note field (`tx_note`)**.
   * Surfaces a direct, clickable link to **Lora TestNet Explorer**.

### 🤖 3.4 Agent Defense & Prompt Injection Firewall
1. **Indirect Prompt Injection Shield:**
   * Analyzes external text, markdown files, and web inputs to detect adversarial prompt-injection payloads before the agent processes them.
2. **Data Exfiltration & Webhook Filter:**
   * Blocks unauthorized outbound calls to Discord, Telegram, or unknown webhook endpoints attempting to siphon environment variables.

---

## 📈 4. Enterprise & Developer Integration Modes

1. **Terminal Agent CLI:**
   * Multi-file audit execution in terminal: `npx tsx scripts/agent-audit.ts file1.py file2.js --tier=tier2`.
2. **GitHub Action CI/CD Gate:**
   * Drops into `.github/workflows/adsec.yml` to audit pull requests and block merges if critical vulnerabilities exist.
3. **PR Diff Mode:**
   * Audits only modified lines in a pull request for sub-200ms turnaround.
4. **Interactive Web Dashboard & Ledger:**
   * Full React web playground with Pera Wallet integration and live on-chain receipts ledger.

---

## 📊 5. Competitive Feature Matrix

| Capability | Generic Linters (ESLint, Flake8) | Free Package Checkers (npm audit) | ADSEC on Algorand x402 |
| :--- | :---: | :---: | :---: |
| **Micro-Payment / Zero Subscription** | ❌ No | ❌ No | ✅ **Yes ($0.01 USDC on Algorand)** |
| **Autonomous AI Agent Discovery** | ❌ No | ❌ No | ✅ **Yes (Bazaar Registered)** |
| **Real-Time Live CVE Feeds** | ❌ No | ⚠️ Partial | ✅ **Yes (Live OSV.dev Query)** |
| **Line-Level Caller Correlation** | ❌ No | ❌ No | ✅ **Yes (AST Walk)** |
| **Supply-Chain Typosquatting** | ❌ No | ❌ No | ✅ **Yes (Levenshtein Distance)** |
| **Actionable Unified Git Diff Fixes** | ❌ No | ❌ No | ✅ **Yes (`git apply` Ready)** |
| **Algorand Smart Contract Rules** | ❌ No | ❌ No | ✅ **Yes (PyTeAL / ASA Opt-In)** |
| **Verifiable On-Chain Audit Attestation** | ❌ No | ❌ No | ✅ **Yes (Algorand Tx Note)** |
| **Agent Prompt Injection Defense** | ❌ No | ❌ No | ✅ **Yes (Built-in Firewall)** |
