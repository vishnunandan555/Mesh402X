# ADSEC — Architecture & Technical Specification

---

## 🏛️ System Architecture

ADSEC (Autonomous Decentralized Security Audit Service) is composed of four decoupled, scalable layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          1. CLIENT / AGENT LAYER                       │
│  • Autonomous AI Agents (Python / Node.js x402 Clients)                │
│  • CI/CD Pre-Commit Hooks (GitHub Actions / GitLab CI)                 │
│  • Web Application Users (React + Vite + Pera / Defly Wallet)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Requests (x402 Protocol)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. X402 PROTOCOL GATEWAY                        │
│  • Hono HTTP Framework (TypeScript, Edge-Ready)                        │
│  • @x402/hono Payment Middleware (Enforces 402 Challenges)             │
│  • GoPlausible Facilitator Settlement (`facilitator.goplausible.xyz`)  │
│  • Algorand TestNet Blockchain (USDC ASA 10458941)                     │
│  • Bazaar Discovery Registry (Dynamic Agent Service Indexing)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Verified Paid Requests ($0.01 - $0.05)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3. ADSEC SECURITY AUDIT ENGINE                    │
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

## 💰 Endpoint Pricing & Specifications

| Endpoint | Method | Price | Target Consumers | Description |
|---|---|---|---|---|
| `/health` | `GET` | **Free** | Monitors, Uptime | Service heartbeat & uptime status |
| `/info` | `GET` | **Free** | Developers, Agents | Active network and endpoint metadata |
| `/weather` | `GET` | **$0.005 USDC** | x402 Verifiers | Starter test payment verification |
| `/adsec/audit` | `POST` | **$0.01 USDC** | Agents, CI/CD | Deterministic + CVE audit & AI diff patch |
| `/meme-generate` | `POST` | **$0.10 USDC** | Creative Agents | AI Meme generator with RAG |

---

## 🔐 Security & Non-Custodial Architecture

1. **Server Statelessness**: The ADSEC Resource Server never holds user funds or private keys. Payments settle directly into the receiver wallet on Algorand TestNet.
2. **Deterministic Fallbacks**: Tier 1 analysis executes locally without external third-party dependencies, guaranteeing sub-second response times even if upstream LLM providers experience downtime.
3. **Safe Memory Handling**: Private keys on automated agents are processed using non-destructive cryptographic primitives (`ed25519Generator`), preventing runtime memory zeroization hazards.
