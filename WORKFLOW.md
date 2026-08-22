# ADSEC — Complete Testing & Operational Workflow

This document details the exact, step-by-step workflow to configure, run, and verify the ADSEC application and its x402 payment rail on Algorand TestNet.

---

## 🛠️ Prerequisites

1. **Node.js LTS** (v18 or v20+)
2. **npm** or **pnpm**
3. **Pera Wallet** mobile app (set to **Algorand TestNet**) or an Algo25 TestNet account.

---

## 📁 Repository Structure

```
Mesh402X/
├── checklist.md                 # Master progress tracker
├── PHASE_1.md                   # Protocol & wallet infrastructure notes
├── WORKFLOW.md                  # Testing workflow guide (this file)
└── x402-Project/
    ├── x402-demo-server/        # Hono x402 Resource Server & ADSEC Engine
    │   ├── engine/              # Security scan engine (secrets, patterns, OSV, LLM diffs)
    │   ├── handlers/            # Route handlers (adsec-audit.ts, weather.ts)
    │   ├── endpoints.config.ts  # x402 payment requirements & Bazaar schemas
    │   └── index.ts             # Server entrypoint (Port 4021)
    │
    ├── 402-demo-client/         # Automated Machine-to-Machine x402 Client
    │   ├── adsec-client.ts      # Live on-chain paid security audit runner
    │   ├── index.ts             # Live on-chain paid demo runner (weather)
    │   ├── check-wallet.ts      # Live TestNet wallet & asset diagnostic
    │   ├── generate-account.ts  # Native Algo25 payer account generator
    │   └── optin-usdc.ts        # 1-click on-chain USDC opt-in script
    │
    └── X402-Usecase/            # React + Vite Frontend Dashboard
        └── projects/X402-Usecase/
```

---

## 🚀 Step-by-Step Testing Workflow

### Step 1: Start the ADSEC Backend Server

1. Navigate to the server directory:
   ```bash
   cd x402-Project/x402-demo-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (`x402-demo-server/.env`):
   ```env
   AVM_ADDRESS=LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ
   FACILITATOR_URL=https://facilitator.goplausible.xyz
   PORT=4021
   ```
   *(Note: The server only needs the public address; no private key is required)*

4. Start the server:
   ```bash
   npm start
   ```
5. Verify health check:
   ```bash
   curl http://localhost:4021/health
   # Returns: {"status":"ok","service":"x402-hackathon-starter"}
   ```

---

### Step 2: Verify HTTP 402 Payment Challenge

Send an unpaid request to verify that the server enforces payment protection:
```bash
curl -i http://localhost:4021/weather
```
**Expected Response:**
- Status: `HTTP/1.1 402 Payment Required`
- Header: `payment-required: eyJ4NDAyVmVyc2lvbiI6Mi...` (Base64-encoded payment requirements: 0.005 USDC to receiver on Algorand TestNet).

---

### Step 3: Configure the Payer Agent Client

1. Navigate to the client directory:
   ```bash
   cd ../402-demo-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `402-demo-client/.env`:
   ```env
   AVM_MNEMONIC="your twenty five word native algorand testnet mnemonic phrase"
   ```
   *(If you don't have an Algo25 account, run `npm run generate-payer` to create one)*

---

### Step 4: Check Wallet Balances & Opt-in Status

Run the automated diagnostic tool:
```bash
npm run check-wallet
```

The script will query Algorand TestNet and display:
```text
═════════════════════════════════════════════════════════════════
🔍 ADSEC / x402 PAYER WALLET STATUS CHECK
═════════════════════════════════════════════════════════════════
✅ Valid Algo25 Payer Address: BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI
   Lora Explorer: https://lora.algokit.io/testnet/account/BLZQ...

📊 Account Balances:
   ALGO Balance:      1.199000 ALGO (Min required: 0.200000 ALGO)
   USDC Opt-in:       ✅ Opted In
   USDC Balance:      0.010000 USDC
─────────────────────────────────────────────────────────────────
🎉 READY! Payer account has sufficient ALGO and USDC.
```

**If action is needed:**
- **Needs ALGO**: Dispense 1 ALGO at [Lora TestNet Dispenser](https://lora.algokit.io/testnet/fund).
- **Needs USDC Opt-in**: Run `npm run optin-usdc` (submits automatic on-chain opt-in).
- **Needs USDC**: Send 0.01 USDC from your Pera Wallet or claim from [Circle Faucet](https://faucet.circle.com/).

---

### Step 5: Execute Automated x402 Payment

Run the automated payment client:
```bash
npm start
```

**What Happens:**
1. Client sends `GET http://localhost:4021/weather`.
2. Intercepts the `HTTP 402` response.
3. Locally signs an Algorand transaction transferring 0.005 USDC to the receiver.
4. Submits to GoPlausible Facilitator for on-chain settlement.
5. Receives `HTTP 200 OK` with the settled payload.

**Expected Output:**
```json
💳 Payment response: {
  "success": true,
  "payer": "BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI",
  "transaction": "KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ",
  "network": "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
}
```

---

### Step 6: Run Live On-Chain ADSEC Security Audit

Run an autonomous machine-to-machine security audit:
```bash
npm run audit
```

Or audit a specific source code file:
```bash
npm run audit -- path/to/source.py --tier=tier2
```

**Output:**
1. Pays **`$0.01 USDC`** on-chain via x402.
2. Returns full vulnerability findings (leaked API keys, SQL injection, OSV CVEs, typosquatting).
3. Produces **actionable unified Git diff patches**.

---

### Step 7: Verify On-Chain on Lora Explorer

1. Copy the `transaction` hash from the terminal output.
2. Open the [Lora Algorand TestNet Explorer](https://lora.algokit.io/testnet).
3. Verify the transaction shows:
   - Type: `axfer` (Asset Transfer)
   - Asset: `10458941` (USDC)
   - Status: `Confirmed`
