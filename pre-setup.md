# ADSEC — Infrastructure & Wallet Setup Guide

> **Goal:** Set up your Algorand TestNet wallets, fund with ALGO & USDC, and verify the payment gate in `x402-Project`.

---

## 1. Core Concepts

- **TestNet:** Free sandbox version of Algorand. All judging for the hackathon evaluates on TestNet.
- **USDC Asset ID (ASA 10458941):** The official Circle TestNet USDC token on Algorand.
- **Asset Opt-In:** On Algorand, an account **must opt in** to an ASA before it can hold or receive it. Both the payer and receiver accounts must opt in.
- **GoPlausible Facilitator:** The hosted facilitator (`https://facilitator.goplausible.xyz`) that verifies payment signatures and broadcasts transactions to Algorand TestNet.
- **x402 Flow:** Request ➔ `402 Payment Required` with pricing headers ➔ Wallet signs transaction ➔ Facilitator verifies & settles on-chain ➔ `200 OK` with data.

---

## 2. Wallet Setup & Funding

1. **Create Accounts on Lora Explorer**:
   - Open [Lora TestNet Explorer](https://lora.algokit.io/testnet).
   - Create **Payer Account** (Save the 25-word mnemonic seed phrase in `.env`).
   - Create **Receiver Account** (Copy public address for `AVM_ADDRESS`).
2. **Fund with TestNet ALGO**:
   - Fund both accounts using [Lora Dispenser / Faucet](https://lora.algokit.io/testnet/fund).
3. **Opt-In to TestNet USDC**:
   - On Lora, open both accounts and opt in to asset `10458941` (TestNet USDC).
4. **Fund Payer with TestNet USDC**:
   - Get USDC on the payer wallet via [Circle Faucet](https://faucet.circle.com/) (select Algorand Testnet).

---

## 3. Configure `.env` Files

### Backend (`x402-Project/x402-demo-server/.env`):
```env
AVM_ADDRESS=YOUR_RECEIVER_PUBLIC_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
```

### Frontend (`x402-Project/X402-Usecase/projects/X402-Usecase/.env.local`):
```env
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_NETWORK=testnet
VITE_API_BASE_URL=http://localhost:4021
VITE_FACILITATOR_URL=https://facilitator.goplausible.xyz
```

---

## 4. Run & Verify

1. **Start Backend**:
   ```bash
   cd x402-Project/x402-demo-server
   npm install
   npm run dev
   ```
2. **Start Frontend**:
   ```bash
   cd x402-Project/X402-Usecase/projects/X402-Usecase
   npm install
   npm run dev
   ```
3. **Verify 402 Challenge**:
   ```bash
   curl -i http://localhost:4021/weather
   ```
   *Expected: `HTTP/1.1 402 Payment Required`*
4. **Verify Paid Flow**:
   Open `http://localhost:5173`, connect Pera/Defly wallet, and execute a request!
