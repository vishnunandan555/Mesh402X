# x402 Global Challenge Build Sprint - Final Submission Checklist

> **Project:** ADSEC (Autonomous Decentralized Security Audit Node)  
> **Target:** Complete all deliverables, deployments, video, and submission before deadline.

---

## 1. Day-of-Hackathon Schedule & Time Budget

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 08:30 - 09:30 AM  │  Registration & Venue Entry                             │
│ 09:30 - 10:00 AM  │  Opening Remarks & Briefing                            │
│ 10:15 AM          │  HACKATHON STARTS                                       │
│ 10:15 - 12:30 PM  │  Block 1: Local Testing, Tx Generation & CI/CD Demo     │
│ 12:30 - 01:30 PM  │  Lunch                                                  │
│ 01:30 - 02:45 PM  │  Block 2: Cloud Deployment (Vercel/Render + Render API) │
│ 02:45 - 03:30 PM  │  Block 3: Record 3-Min MVP Demo Video & Upload          │
│ 03:30 - 04:00 PM  │  Block 4: Final README Audit & Incognito Link Check     │
│ 04:00 PM          │  SUBMISSION WINDOW OPENS (Submit Immediately)           │
│ 05:00 PM          │  Hard Submission Deadline                               │
│ 05:30 - 07:30 PM  │  Judging Round (Live Demo at Table)                     │
│ 07:45 - 08:15 PM  │  Top 5 Presentations & Winners Announcement             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 5 Non-Negotiable Submission Deliverables

| # | Deliverable | Requirement | Status |
| :-: | :--- | :--- | :-: |
| **1** | **Public GitHub Repo** | Clean code, proper `.gitignore` (no private keys/secrets), `@x402-avm` in `package.json`. | [x] |
| **2** | **Rich Root `README.md`** | Problem, Solution, Architecture Diagram, USP, Local setup guide, and Live Lora Tx link. | [x] |
| **3** | **Live Deployed App** | Public URL for Playground UI (Render/Vercel) + Public Backend API URL (Render). | [x] |
| **4** | **Live Algorand TestNet Tx** | Confirmed transaction hash on [Lora Explorer](https://lora.algokit.io/testnet) via GoPlausible facilitator. | [x] |
| **5** | **MVP Demo Video (< 3 min)** | Public YouTube or Google Drive link (Must open in Incognito without login). | [ ] |

---

## 3. Step-by-Step Execution Plan

### Block 1: Core Flow & Live TestNet Transactions

- [x] **1.1 TestNet Wallet Balance Check:**
  - Verify Payer account has at least **5 ALGO** and **50 TestNet USDC** (ASA `10458941`).
  - Dispensers:
    - ALGO: [Algorand TestNet Dispenser](https://lora.algokit.io/testnet/dispenser)
    - USDC: [Circle TestNet Faucet](https://faucet.circle.com)
- [x] **1.2 Verify All 4 x402 Endpoints:**
  - Execute test calls for all 4 endpoints:
    1. `POST /adsec/scan` ($0.01 USDC)
    2. `POST /adsec/remediate` ($0.03 USDC)
    3. `POST /adsec/attest` ($0.01 USDC)
    4. `POST /adsec/audit` ($0.05 USDC)
- [x] **1.3 Save Real Lora TestNet Transaction IDs:**
  - Copy confirmed `txId` from Lora Explorer for inclusion in the final pitch deck.

### Block 2: Cloud Deployment & Keep-Alive

- [x] **2.1 Backend Deployment on Render:**
  - Deploy `x402-demo-server` as a Node.js Web Service in Singapore region.
  - Configure environment variables: `AVM_ADDRESS`, `FACILITATOR_URL`, `PORT=4021`.
- [x] **2.2 Frontend Deployment:**
  - Deploy `X402-Usecase` as a Static Site with `VITE_API_BASE_URL` pointing to backend.
- [x] **2.3 Keep-Alive Ping on cron-job.org:**
  - Configure free ping hitting `https://your-backend.onrender.com/health` every 10 minutes.

### Block 3: Video Recording (Under 3 Minutes)

- [ ] **3.1 Record 3-Minute Video:**
  - 0:00 - 0:45: Problem statement (Agents need security checks before deploying).
  - 0:45 - 1:45: Live UI demo (Connect Pera wallet -> 402 challenge -> sign TestNet USDC -> 200 OK findings & Git diff).
  - 1:45 - 2:30: Terminal CLI demo (`npm run live` / `npm run discover`).
  - 2:30 - 3:00: Show confirmed transaction on Lora Explorer.

---

## 4. Final Submission Form Template

- **Project Name:** ADSEC (Autonomous Decentralized Security Audit Node)
- **Tagline:** Pay-per-call pre-flight security auditor and on-chain attestation node for AI agents on Algorand x402.
- **GitHub Repository:** `https://github.com/vishnunandan555/Mesh402X`
- **Live Demo URL:** `https://adsec-frontend.onrender.com` (or Vercel URL)
- **Backend API URL:** `https://adsec-backend.onrender.com`
- **Algorand TestNet Transaction (Lora):** `https://lora.algokit.io/testnet`
