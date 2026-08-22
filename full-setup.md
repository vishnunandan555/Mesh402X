# ADSEC — Complete 3-Day Build & Pitch Plan

> **The Pitch:** ADSEC is a production-grade, pay-per-call **Code Security Audit Node** deployed on the open **x402 protocol** and **Algorand TestNet**. It enables autonomous AI agents and developers to audit code, correlate CVEs to exact line numbers, and receive actionable git diff fixes before deploying to production.

---

## 🎯 Final Feature Scope

### Tier 1 — Deterministic, Fast, Low-Cost:
1. **Hardcoded Secret / Credential Scanner:** AWS, OpenAI, GitHub PATs, JWTs, private keys.
2. **Dangerous Pattern Scanner:** `eval()`, SQL string concatenations, unsafe deserialization, prototype pollution.
3. **Typosquatting Dependency Checker:** Levenshtein distance check against top 500 packages.
4. **Outdated / Abandoned Package Detector:** Registry API version checks.
5. **OSV.dev CVE Query & Line Correlation:** Queries public CVE database and correlates vulnerable functions directly to the user's calling code lines.
6. **Health Scoring & Deduplication:** 0–100 weighted security score and clean finding categorization.

### Tier 2 — AI-Powered Semantic Review & Auto-Fixes:
7. **Semantic Vulnerability Analysis:** LLM catches business logic flaws, BOLA, IDOR, and auth bypasses.
8. **Actionable Git Diff / Patch Generation:** Produces unified diff snippets ready to apply via `git apply`.

### Proof of Audit & Discovery:
9. **On-Chain Proof-of-Audit:** Surfaces the settled Algorand TestNet transaction ID in the audit response.
10. **Bazaar Discovery Layer:** Declares metadata on GoPlausible Bazaar for open agent indexing.

---

## 📅 The 3-Day Milestone Schedule

### DAY 1: Infrastructure, Wallets & Payment Proof ✅
- [x] Create 2 TestNet accounts on Lora (Payer & Receiver).
- [x] Fund both with TestNet ALGO and opt into TestNet USDC (ASA `10458941`).
- [x] Fund Payer with TestNet USDC via Circle faucet.
- [x] Configure backend `.env` and frontend `.env.local`.
- [x] Verify `x402-Project` backend returns `HTTP 402` and connects to GoPlausible Facilitator.

### DAY 2: Build the ADSEC Security Engine (Phase 2) ✅
- [x] Implement engine types & scoring in `x402-demo-server/engine/`.
- [x] Build Tier 1 regex scanners: `secrets.ts` and `patterns.ts`.
- [x] Build dependency checkers: `typosquat.ts` and `osv.ts` with line correlation.
- [x] Build Tier 2 LLM review & git diff generator: `llm.ts` and `diff-generator.ts`.
- [x] Wire handler `handlers/adsec-audit.ts` into `endpoints.config.ts` and `index.ts`.
- [x] Test standalone audit execution with mock vulnerable files (`scripts/agent-audit.ts` verified in 627ms).

### DAY 3: React Dashboard, Live Deploy & Pitch Prep (Phase 3 & 4)
- [ ] Build interactive `AdsecAudit.tsx` component in React frontend.
- [ ] Create standalone CLI agent script for automated demo.
- [ ] Deploy backend to Render (free tier) and configure keep-alive ping.
- [ ] Verify live on-chain settlement on Lora Explorer and Bazaar indexing.
- [ ] Record backup 60-second video clip of the payment + audit flow.
- [ ] Deliver winning 3-minute hackathon pitch!

---

## 🔗 Key Links & Resources
- **Lora TestNet Explorer:** https://lora.algokit.io/testnet
- **Circle USDC Faucet:** https://faucet.circle.com/
- **GoPlausible Facilitator:** https://facilitator.goplausible.xyz
- **OSV.dev API:** https://osv.dev
- **x402 Specification:** https://x402.money
