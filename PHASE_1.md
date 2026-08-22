# ADSEC — Phase 1: Infrastructure, Wallets & x402 Payment Rail

---

## 1. What is the x402 Protocol?

The **x402 protocol** is an open, decentralized internet standard that enables native **HTTP-level micro-payments** for digital APIs, resources, and autonomous AI agents.

Traditionally, web APIs monetize through monthly subscriptions, credit card forms, or API keys tied to centralized SaaS billing. This model fails for autonomous AI agents, automated pipelines, and machine-to-machine (M2M) interactions, where:
- Agents cannot sign up with credit cards or KYC portals.
- Agents require **per-request, pay-as-you-go micro-transactions** (e.g., $0.005 or $0.01).
- Settlement must occur trustlessly on high-throughput, low-fee blockchains.

### The HTTP 402 Architecture
HTTP status code **`402 Payment Required`** was reserved in the original 1990s HTTP standard for future digital cash systems. The x402 protocol turns this vision into reality:

```
┌──────────────┐                                      ┌────────────────────┐
│ AI Agent /   │ ─── 1. HTTP Request (No Payment) ──> │ ADSEC Server       │
│ x402 Client  │ <── 2. HTTP 402 + Payment Spec ───── │ (x402 Middleware)  │
│              │                                      └────────────────────┘
│              │
│              │ ─── 3. Local Signature (Ed25519) ─┐
│              │                                   │
│              │ ─── 4. Submit Signed Tx ────────> ┌────────────────────┐
│              │                                   │ GoPlausible        │
│              │ <── 5. Settlement Receipt ─────── │ Facilitator        │
│              │                                   └─────────┬──────────┘
│              │                                             │
│              │                                             ▼ 6. Settle Tx
│              │                                   ┌────────────────────┐
│              │                                   │ Algorand TestNet   │
│              │                                   │ (USDC ASA 10458941)│
│              │                                   └─────────┬──────────┘
│              │                                             │
│              │ ─── 7. Re-send Request with Payment-Sig ──> │ (Payment Verified)
│              │ <── 8. HTTP 200 OK + Audit Report ───────── │ Executes Engine
└──────────────┘                                      └────────────────────┘
```

---

## 2. How x402 is Utilized in ADSEC

In **ADSEC (Autonomous Decentralized Security Audit Service)**, x402 serves as the economic security layer:
1. **Zero Subscriptions**: Any AI agent or developer can submit code for an instant audit without registering or managing API keys.
2. **Deterministic Pricing**:
   - **Tier 1 (Deterministic CVE & Secret Scan)**: `$0.01 USDC` (10,000 micro-units).
   - **Tier 2 (AI Semantic Logic Review & Git Diff Patches)**: `$0.05 USDC` (50,000 micro-units).
   - **Demo Endpoint (`/weather`)**: `$0.005 USDC` (5,000 micro-units).
3. **Bazaar Discovery**: The server registers its capabilities on the GoPlausible Facilitator Discovery network, allowing autonomous agents to dynamically discover ADSEC's audit services.

---

## 3. Wallet Architecture: Roles & Keys

We operate two distinct Algorand TestNet accounts:

```
┌──────────────────────────────────────────────────────────┐
│                   PAYER ACCOUNT                          │
│ • Role: AI Agent / Developer Client                      │
│ • Address: BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI
│ • Key Material: 25-word native Algo25 Mnemonic (Client)  │
│ • Assets: Holds ALGO (gas) + TestNet USDC (ASA 10458941) │
└────────────────────────────┬─────────────────────────────┘
                             │
                             │ Pays 0.005 - 0.01 USDC
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  RECEIVER ACCOUNT                        │
│ • Role: ADSEC Resource Server Payout Wallet              │
│ • Address: LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ
│ • Key Material: None required on server (Public Address) │
│ • Assets: Opted into USDC (ASA 10458941)                 │
└──────────────────────────────────────────────────────────┘
```

### Critical Security Rule:
- The **backend server NEVER requires a private key or passphrase**. It only needs the public receiving address (`AVM_ADDRESS`).
- The **payer client** holds the private signing key locally in its private `.env` to sign transactions autonomously.

---

## 4. Key Breakthrough: 24-Word vs 25-Word Mnemonic Derivation

During Phase 1, we resolved an essential cryptographic distinction in the Algorand ecosystem:

### The Problem:
- **24-Word Mnemonic**: Modern BIP-39 standard used by mobile wallets (Pera Wallet, Defly).
- **25-Word Mnemonic**: Algorand's native legacy format (24 words entropy + 1 checksum word).
- The official `@x402/avm` and `@algorandfoundation/algokit-utils` Node libraries expect a **native 25-word Algo25 mnemonic** to derive Ed25519 signing keys.

### The Template Zeroization Bug & Our Fix:
In the original starter kit code:
```typescript
// ❌ BUG in starter kit:
const wrappedSecret = await ed25519SigningKeyFromWrappedSecret(wrappedSeed);
```
`unwrapEd25519Seed` wiped the seed buffer in memory to all zeros as a security measure, causing `toClientAvmSigner` to derive an address from 32 zero bytes (`HNVCPPG...`) instead of the true private key!

**Our Fix**:
We refactored the derivation across `index.ts`, `check-wallet.ts`, and `generate-account.ts` using `ed25519Generator` directly:
```typescript
// ✅ FIXED: Non-destructive key derivation
function getSecretKeyFromMnemonic(avmMnemonic: string): string {
  const seed = seedFromMnemonic(avmMnemonic.trim());
  const { ed25519Pubkey } = ed25519Generator(new Uint8Array(seed));
  return Buffer.concat([Buffer.from(seed), Buffer.from(ed25519Pubkey)]).toString('base64');
}
```

---

## 5. Live On-Chain Settlement Proof

The Phase 1 live end-to-end payment was successfully executed and confirmed on **Algorand TestNet**:

| Parameter | Value |
|---|---|
| **Transaction ID** | [`KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ`](https://lora.algokit.io/testnet/transaction/KYDRKTKYR4Y57L6DUQITC7CUZW2IUONHB5FIGMK5AJSB5ONSZRKQ) |
| **Sender (Payer)** | [`BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI`](https://lora.algokit.io/testnet/account/BLZQISYSYJSO5UAQ4XYBI7YWSIJAW4TQ6XKL43WEXWYRCCXQU2S7AVCJMI) |
| **Receiver** | [`LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`](https://lora.algokit.io/testnet/account/LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ) |
| **Asset ID** | `10458941` (Algorand TestNet USDC) |
| **Amount Paid** | `0.005 USDC` (5,000 base units) |
| **Confirmed Round** | `66557283` |
| **Facilitator** | GoPlausible Facilitator (`https://facilitator.goplausible.xyz`) |
| **Result** | `HTTP 200 OK` + Settled JSON Payload |

---

## 6. Phase 1 Deliverables Summary

1. ✅ **x402 Resource Server**: Configured on Hono with CORS, logging, and GoPlausible facilitator registration.
2. ✅ **USDC Asset Opt-in**: Automated CLI script (`optin-usdc.ts`) for 1-click ASA 10458941 opt-in.
3. ✅ **Account Diagnostics**: Live balance and opt-in status checker (`check-wallet.ts`).
4. ✅ **Account Generator**: Native 25-word Algo25 account generator (`generate-account.ts`).
5. ✅ **Automated x402 Client**: Automated payment-wrapping client (`index.ts` and `adsec-client.ts`).
