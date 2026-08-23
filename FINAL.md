# 🏆 x402 Bengaluru PreHack — Final Countdown Checklist (Finish Before 4:00 PM)

> **Event:** x402 Global Challenge PreHack — Bengaluru  
> **Project:** ADSEC (Autonomous Decentralized Security Audit Node)  
> **Target:** Complete all deliverables, deployments, video, and submission before **4:00 PM** (Submission window opens at 4:00 PM, hard deadline at 5:00 PM).

---

## ⏰ Day-of-Hackathon Schedule & Time Budget

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 08:30 - 09:30 AM  │  Registration & Venue Entry (Startup Park, 3rd Floor)  │
│ 09:30 - 10:00 AM  │  Opening Remarks & Briefing                            │
│ 10:15 AM          │  🚀 HACKATHON STARTS                                   │
│ 10:15 - 12:30 PM  │  🛠️ Block 1: Local Testing, Tx Generation & CI/CD Demo │
│ 12:30 - 01:30 PM  │  🍽️ Lunch (Ground floor cafeteria)                     │
│ 01:30 - 02:45 PM  │  ☁️ Block 2: Cloud Deployment (Vercel + Render)        │
│ 02:45 - 03:30 PM  │  🎥 Block 3: Record 3-Min MVP Demo Video & Upload      │
│ 03:30 - 04:00 PM  │  📝 Block 4: Final README Audit & Incognito Link Check │
│ 04:00 PM          │  📤 SUBMISSION WINDOW OPENS (Submit Immediately)        │
│ 05:00 PM          │  🛑 Hard Submission Deadline                           │
│ 05:30 - 07:30 PM  │  🧑‍⚖️ Judging Round (Live Demo at Table)                │
│ 07:45 - 08:15 PM  │  🌟 Top 5 Presentations & Winners Announcement         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The 5 Non-Negotiable Submission Deliverables

Before 4:00 PM, you must have these 5 items ready:

| # | Deliverable | Requirement | Status |
| :-: | :--- | :--- | :-: |
| **1** | **Public GitHub Repo** | Clean code, proper `.gitignore` (no private keys/secrets), `@x402-avm` in `package.json`. | [ ] |
| **2** | **Rich Root `README.md`** | Problem, Solution, Architecture Diagram, USP, Local setup guide, and Live Lora Tx link. | [ ] |
| **3** | **Live Deployed App** | Public URL for Playground UI (Vercel) + Public Backend API URL (Render/VPS). | [ ] |
| **4** | **Live Algorand TestNet Tx** | Confirmed transaction hash on [Lora Explorer](https://lora.algokit.io/testnet) via GoPlausible facilitator. | [ ] |
| **5** | **MVP Demo Video (< 3 min)** | Public YouTube or Google Drive link (Must open in Incognito without login). | [ ] |

---

## 📋 Step-by-Step Execution Plan (Before 4:00 PM)

### 🛠️ Block 1: Core Flow & Live TestNet Transactions (10:15 AM – 12:30 PM)

- [ ] **1.1 TestNet Wallet Balance Check:**
  - Verify Payer account has at least **5 ALGO** and **50 TestNet USDC** (ASA `10458941`).
  - Dispensers:
    - ALGO: [Algorand TestNet Dispenser](https://lora.algokit.io/testnet/dispenser)
    - USDC: [Circle TestNet Faucet](https://faucet.circle.com)
- [ ] **1.2 Verify All 4 x402 Endpoints Locally:**
  - Run backend: `cd x402-Project/x402-demo-server && pnpm dev`
  - Run frontend: `cd x402-Project/X402-Usecase && pnpm dev`
  - Execute live test calls for all 4 endpoints:
    1. `POST /adsec/scan` ($0.01 USDC)
    2. `POST /adsec/remediate` ($0.03 USDC)
    3. `POST /adsec/attest` ($0.01 USDC)
    4. `POST /adsec/audit` ($0.05 USDC)
- [ ] **1.3 Save 2 High-Value Lora Transaction URLs:**
  - Execute a clean audit payment and copy the confirmed Algorand Tx IDs from Lora:
    - *Tx 1 (Attestation / Full Audit):* `https://lora.algokit.io/testnet/transaction/<TXID_1>`
    - *Tx 2 (Scan / Remediation):* `https://lora.algokit.io/testnet/transaction/<TXID_2>`
  - Paste these exact links into `README.md`.
- [ ] **1.4 Test the Agent Terminal CLI:**
  - Run: `npx tsx scripts/agent-audit.ts test-files/vulnerable.py --tier=tier2`
  - Verify that the CLI pays $0.05 USDC, prints findings, and outputs the `git apply` diff.

---

### ☁️ Block 2: Cloud Deployment & Public URLs (1:30 PM – 2:45 PM)

- [ ] **2.1 Backend Deployment (Render / Railway / VPS):**
  - Root directory: `x402-Project/x402-demo-server`
  - Build command: `pnpm install && pnpm build`
  - Start command: `pnpm start`
  - Environment variables to set on host:
    - `PORT=3000`
    - `ALGOD_SERVER=https://testnet-api.algonode.cloud`
    - `FACILITATOR_URL=https://facilitator.goplausible.xyz`
    - `RECEIVER_ADDRESS=<YOUR_SERVER_ALGORAND_ADDRESS>`
    - `GROQ_API_KEY` / `GEMINI_API_KEY` (if using LLM auto-diffs)
  - Verify public health check: `curl https://<YOUR_BACKEND_URL>/health`
- [ ] **2.2 Frontend Deployment (Vercel / Cloudflare Pages):**
  - Root directory: `x402-Project/X402-Usecase`
  - Build command: `pnpm build`
  - Output directory: `dist`
  - Environment variable:
    - `VITE_BACKEND_URL=https://<YOUR_BACKEND_URL>`
- [ ] **2.3 Prevent Backend Sleep (Free Tier):**
  - Set up a free 5-minute ping on [cron-job.org](https://cron-job.org) hitting `https://<YOUR_BACKEND_URL>/health` so the server never sleeps during judges' testing.

---

### 🎥 Block 3: 3-Minute MVP Demo Video (2:45 PM – 3:30 PM)

> ⚠️ **Video Rule:** Maximum **3 minutes** (180 seconds). Keep it fast-paced, high energy, and focused on the live payment & audit.

#### 🎬 3-Minute Script Structure:
1. **0:00 – 0:30 (The Problem & USP):**
   - *"Autonomous AI coding agents generate code, but they cannot safely deploy to production without independent security verification. Subscribing to enterprise tools costs $500/mo. ADSEC lets agents pay $0.01 per scan via x402 on Algorand."*
2. **0:30 – 1:30 (Live React Playground Demo):**
   - Select a vulnerable Python / Algorand PyTeAL sample in the UI.
   - Click **Run Audit**.
   - Show the 402 Payment Required challenge ➔ Pera Wallet / Key Signing ➔ 200 OK Response.
   - Show the Health Score, CVE details from OSV.dev, and the generated Git Diff patch.
3. **1:30 – 2:15 (Live Terminal Agent CLI & On-Chain Proof):**
   - Run `pnpm agent:audit target.py` in terminal.
   - Show autonomous payment signature and the live Algorand TestNet transaction link on Lora Explorer.
4. **2:15 – 3:00 (Architecture, CI/CD Gate & Wrap-up):**
   - Show architecture diagram (Agent ➔ x402 Server ➔ GoPlausible Facilitator ➔ Algorand).
   - Conclude with how this enables trustless, agentic software engineering.

#### 📤 Video Upload Checklist:
- [ ] Record via Loom / OBS / Screen Studio.
- [ ] Upload to **YouTube** (Unlisted or Public) OR **Google Drive**.
- [ ] **Crucial:** If using Google Drive, set sharing to **"Anyone with the link can view"**.

---

### 📝 Block 4: Final Repository & Submission Polish (3:30 PM – 4:00 PM)

- [ ] **4.1 Git Security Scrub:**
  - Double check `git status` to ensure **NO `.env` files or private keys** are tracked in git.
- [ ] **4.2 Push to Public GitHub Repository:**
  - `git add . && git commit -m "feat: complete x402 ADSEC submission build" && git push origin main`
  - Ensure repo visibility is set to **Public** in GitHub Settings.
- [ ] **4.3 Test in Incognito Window (The "Zero-Permission" Test):**
  - [ ] GitHub Repository URL opens in incognito.
  - [ ] Live Frontend Web App URL loads and connects to backend in incognito.
  - [ ] Demo Video link plays without asking for Google sign-in.
  - [ ] Lora Algorand TestNet Tx URL opens and displays confirmed status.
- [ ] **4.4 Submit by 4:00 PM:**
  - Fill and submit the official hackathon submission form as soon as the window opens.

---

## 🧑‍⚖️ Judging Round (5:30 PM – 7:30 PM) — Live Pitch Checklist

When judges walk up to your table, follow this 90-second pitch flow:

1. **The Hook:**
   *"We built ADSEC: an autonomous, pay-per-call security auditor and on-chain attestation oracle for AI agents on Algorand x402."*
2. **The Demo Action:**
   *"Watch this AI agent audit vulnerable code in 800ms. It hits HTTP 402, signs a $0.01 USDC micro-payment on Algorand TestNet, gets real-time CVEs from OSV.dev, and generates a ready-to-apply Git diff patch."*
3. **Show the On-Chain Explorer:**
   Open the confirmed Lora Explorer link showing the transaction note and timestamped proof of audit.
4. **The USP Differentiation:**
   *"Unlike static linters or monthly SaaS tools, ADSEC is subscriptionless, provides live zero-day CVE correlation, and acts as an independent on-chain gate for autonomous CI/CD pipelines."*

---

## 🆘 Emergency Troubleshooting & Fallbacks

| Failure Scenario | Instant Fix |
| :--- | :--- |
| **Facilitator / Network latency during live demo** | Have the Terminal CLI output and a pre-mined Lora Tx tab already open in browser tabs. |
| **Backend cold start on free hosting** | Keep a terminal window running `curl -s https://<YOUR_BACKEND_URL>/health` every 60s. |
| **TestNet faucet rate-limited** | Pre-fund your payer wallet with 50+ USDC before lunch. |
| **Wi-Fi instability at venue** | Keep local backend (`localhost:3000`) and frontend (`localhost:5173`) running as an instant offline/local fallback demo. |

Good luck! Build fast, test on-chain, submit early, and bring home the win! 🚀
