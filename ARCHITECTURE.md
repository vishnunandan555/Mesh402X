# 🐍 MEDUSA (ADSEC) — Architecture & Technical Specification

---

## 🏛️ System Architecture

Medusa is composed of four decoupled, scalable layers serving both **Autonomous AI Agents** and **Human Developers**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          1. CLIENT / AGENT LAYER                       │
│  • Autonomous AI Agents (using Medusa_Skill.md & medusa-scripts/)      │
│  • CI/CD Autonomous Security Gates (GitHub Actions / GitLab CI)        │
│  • Web Application Users (Dual-Mode React UI + Pera / Defly Wallet)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Requests (x402 Protocol)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. X402 PROTOCOL GATEWAY                        │
│  • Hono HTTP Framework (TypeScript, Node.js / Edge-Ready)              │
│  • @x402/hono Payment Middleware (Enforces HTTP 402 Challenges)        │
│  • GoPlausible Facilitator Settlement (`facilitator.goplausible.xyz`)  │
│  • Algorand TestNet Blockchain (USDC ASA 10458941)                     │
│  • GoPlausible Bazaar Discovery (Dynamic Agent Service Indexing)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Verified Paid Requests ($0.001 USDC)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3. MEDUSA SECURITY AUDIT ENGINE                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tier 1: Deterministic Engine (<50ms)                             │  │
│  │ • Secret Scanner: AWS, OpenAI, GitHub PAT, JWT, Private Keys     │  │
│  │ • Dangerous Patterns: eval(), exec(), pickle, SQLi, Command Inj  │  │
│  │ • Supply Chain: Typosquatting detection via Levenshtein distance │  │
│  │ • OSV.dev CVE Query: Real-time public vulnerability database     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tier 2: AI Semantic Logic & Diff Engine                          │  │
│  │ • LLM Semantic Review: Auth bypass, IDOR, logic flaws            │  │
│  │ • Unified Diff Generator: Actionable Git patch generation        │  │
│  │ • Weighted Scoring: 0–100 Health Score calculation               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      4. SETTLEMENT & AUDIT RECEIPTS                    │
│  • On-Chain Algorand TestNet Transaction Hash (Immutable Proof)        │
│  • Algorand Lora Explorer Deep-Links                                   │
│  • JSON Structured Findings + Standard Unified Git Diff (.patch)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Endpoint Pricing & Modular Script Specifications

All paid tiers settle in **TestNet USDC (ASA #10458941)** on Algorand at **$0.001 USDC (1,000 microUSDC)**.

| Endpoint | Method | Price | Modular Script | Target Consumers | Description |
|---|---|---|---|---|---|
| `/adsec/scan` | `POST` | **$0.001 USDC** | `audit-scan.ts` | Pre-commit hooks, fast linters | Fast deterministic secret, CVE, and AST vulnerability scan. |
| `/adsec/remediate` | `POST` | **$0.001 USDC** | `audit-remediate.ts` | Autonomous self-healing bots | Generates language-aware unified Git diff patches (`git apply` ready). |
| `/adsec/attest` | `POST` | **$0.001 USDC** | `audit-attest.ts` | Release pipelines, compliance | Computes SHA-256 code hash and broadcasts on-chain Algorand certificate. |
| `/adsec/audit` | `POST` | **$0.001 USDC** | `audit-full.ts` | Coding agents, comprehensive audits | Complete pipeline: Scan + AI Review + Unified Diffs + Attestation. |
| Financial History | — | **$0.00** | `wallet-history.ts` | Financial audits, reporting | On-chain ledger explorer: shows transaction history, total audits bought & USDC spent. |

---

## 🔄 Dual Interaction Modes

### Mode 1: Headless Autonomous Agent (Agent-to-Agent)
1. **Installation:** Any codebase runs `curl -fsSL .../install.sh | bash`.
2. **Decentralized Discovery:** Queries `GET https://facilitator.goplausible.xyz/discovery/resources`.
3. **Execution:** Reads `Medusa_Skill.md`, chooses script in `medusa-scripts/`, signs payment with `AGENT_MNEMONIC`.
4. **Self-Healing:** Automatically runs `git apply audit.patch`.

### Mode 2: Web Playground (Human-to-Agent)
1. **Interactive Guide:** Tab 1 provides copyable installer commands and live Bazaar inspection.
2. **Manual Auditor:** Tab 2 provides Pera/Defly wallet connection, code presets, live ASCII terminal animation, and on-chain ledger links.
