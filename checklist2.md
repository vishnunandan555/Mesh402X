# 🌐 Global x402 Go-Live & Bazaar Discovery Checklist

> **Goal:** Deploy backend and frontend, trigger proof-of-settlement indexing on GoPlausible Facilitator, and verify live on Algorand TestNet & Lora Explorer.

---

## 📊 Status Overview

- [x] **Phase 1: TestNet Wallets & USDC Opt-In** (Completed & Verified ✅)
- [ ] **Phase 2: Render Backend Deployment & Config** (Action required: 1-click Render deploy)
- [ ] **Phase 3: Trigger GoPlausible Bazaar Indexing (First Settlement against public URL)**
- [ ] **Phase 4: Global Bazaar & Lora Explorer Verification**
- [ ] **Phase 5: Vercel Frontend Wiring & End-to-End Test**

---

## 🛠️ Phase 1: Algorand TestNet Wallet Preparation ✅

### 1.1 Receiver Wallet (Your Server Address) ✅
- Address receiving payments from customers and autonomous agents.
- **Configured Address:** `LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ` (or your Pera address)
- **Status:** Opted into **TestNet USDC** (ASA ID: `10458941`).

### 1.2 Payer Wallet (For CLI Agent / Testing) ✅
- **Configured Address:** `BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI`
- **Funded:** 1.199 ALGO + Opted into USDC ASA 10458941.
- **Verified On-Chain TxIDs:**
  - TxID 1: [`KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ`](https://lora.algokit.io/testnet/transaction/KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ)
  - TxID 2: [`EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA`](https://lora.algokit.io/testnet/transaction/EZD7DHBD64QRAO7CSCA7OYUCD3ARZOXALOOVUTI5NFRL7VTWTJFA)

---

## ☁️ Phase 2: Deploy & Configure Backend on Render

### 2.1 Render Web Service Settings
- **Repository:** `vishnunandan555/Mesh402X`
- **Root Directory:** `x402-Project/x402-demo-server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

### 2.2 Environment Variables on Render
Add these under **Environment** in the Render Dashboard:

| Key | Value | Description |
| :--- | :--- | :--- |
| `AVM_ADDRESS` | `YOUR_RECEIVER_ALGORAND_WALLET_ADDRESS` | Receiving wallet (opted into USDC) |
| `FACILITATOR_URL` | `https://facilitator.goplausible.xyz` | GoPlausible Facilitator |
| `PORT` | `4021` | Application port |
| `GROQ_API_KEY` | `gsk_...` *(optional)* | Fast AI remediation diffs |

### 2.3 Verify Public Health Check
```bash
curl -s "https://<YOUR_RENDER_SUBDOMAIN>.onrender.com/health"
```
*Expected response:* `{"status":"ok","service":"x402-hackathon-starter","uptime":...}`

---

## ⚡ Phase 3: Trigger Global Bazaar Cataloging

> [!IMPORTANT]
> The GoPlausible Facilitator uses **Proof-of-Settlement indexing**. An endpoint will **only appear in the global catalog** once at least **1 real on-chain payment** has settled against its public URL.

### 3.1 Configure Local Tester Mnemonic
In `x402-Project/x402-demo-server/.env`:
```ini
PAYER_MNEMONIC="word1 word2 word3 ... 25-word-testnet-wallet-seed-phrase"
AVM_ADDRESS=YOUR_RECEIVER_ALGORAND_WALLET_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
```

### 3.2 Execute the Inaugural On-Chain Payment
Run the autonomous agent script targeting your **public Render URL**:

```bash
cd x402-Project/x402-demo-server
npx tsx scripts/agent-live-onchain.ts https://<YOUR_RENDER_SUBDOMAIN>.onrender.com
```

*What happens automatically:*
1. Agent hits public Render URL ➔ Receives `HTTP 402 Payment Required`.
2. Agent signs 0.05 USDC ASA transfer with `PAYER_MNEMONIC`.
3. Facilitator broadcasts & settles on Algorand TestNet.
4. GoPlausible catalogs your URL and metadata into the global Bazaar.
5. Returns confirmed transaction hash.

---

## 🔍 Phase 4: Verification (Lora Explorer & Bazaar)

### 4.1 Verify on GoPlausible Global Catalog
Query the live registry to confirm your Render service is listed:
```bash
curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true" | grep "<YOUR_RENDER_SUBDOMAIN>.onrender.com"
```

### 4.2 Verify Transaction on Lora Explorer
Check your confirmed transaction:
```text
https://lora.algokit.io/testnet/transaction/<YOUR_TRANSACTION_ID>
```
*Verify that it shows an Asset Transfer of USDC (ASA `10458941`) to your `AVM_ADDRESS`.*

---

## 🎨 Phase 5: Wire Up Frontend (Vercel)

### 5.1 Configure Vercel Environment Variables
In your Vercel project settings for `X402-Usecase`:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://<YOUR_RENDER_SUBDOMAIN>.onrender.com` |
| `VITE_FACILITATOR_URL` | `https://facilitator.goplausible.xyz` |
| `VITE_ALGOD_SERVER` | `https://testnet-api.algonode.cloud` |
| `VITE_ALGOD_NETWORK` | `testnet` |

### 5.2 Test End-to-End in Browser
1. Visit your Vercel app URL (`https://<YOUR_APP>.vercel.app`).
2. Connect Pera / Defly TestNet wallet.
3. Run a scan / audit.
4. Approve the transaction in your wallet.
5. Confirm that the report & Git diff patch render in < 5 seconds.
