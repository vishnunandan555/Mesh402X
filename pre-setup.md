# ADSEC — Infrastructure Setup Only (no ADSEC logic yet)

Goal: by the end of this doc, you have a live server on Algorand TestNet that returns a real
`402 Payment Required`, accepts a real signed payment via the GoPlausible facilitator, settles it
on-chain, and returns a placeholder JSON response — with nothing ADSEC-specific written yet. This
is the plumbing. Prove all of it works before writing a single line of audit logic.

---

## 1. Core concepts (read once, you won't need to think about this again)

- **Account/wallet** = a public address + private key pair. You'll handle the private key only as
  a **mnemonic** (25-word seed phrase). Never commit it, never log it, never paste it anywhere
  public.
- **TestNet** = free-money sandbox version of Algorand. Confirmed by the hackathon admins as what
  the final evaluation checks — everything here uses TestNet, not MainNet.
- **ASA (Algorand Standard Asset)** = a token on Algorand, e.g. TestNet-USDC. Algorand-specific
  gotcha: an account must **opt in** to an asset before it can hold or receive it. This is the
  single most common setup failure — do it for both accounts below, not just one.
- **Facilitator** = a hosted service (GoPlausible, in this case) that verifies and settles
  payments on-chain so you don't run a blockchain node yourself. Your server delegates to it.
- **x402 flow, in order:** client requests → server returns `402` with payment details in headers
  → client signs a payment → client retries with the payment proof attached → facilitator
  verifies + settles on-chain → server returns the real data.
- **Bazaar** = the shared discovery index (already-existing infra, not something you build) that
  lets any agent find your endpoint once it's deployed and declared.

---

## 2. Environment

- [ ] Install Node.js LTS: https://nodejs.org
- [ ] Install pnpm: `npm i -g pnpm`
- [ ] (Optional) Install AlgoKit CLI: https://dev.algorand.co/algokit/algokit-intro
- [ ] Confirm versions: `node -v` (should be 18+), `pnpm -v`

---

## 3. Create two TestNet accounts

You need exactly two accounts for the full flow to make sense: a **payer** (stands in for the AI
agent client) and a **receiver** (your ADSEC server's address, where payments land).

- [ ] Go to Lora, Algorand's web wallet/explorer: https://lora.algokit.io/testnet
- [ ] Create account #1 — this is your **payer**. Save its 25-word mnemonic somewhere local
      (a `.env` file that's gitignored — never commit it)
- [ ] Create account #2 — this is your **receiver**. You only need its public address, not its
      mnemonic, for the server side
- [ ] Write both addresses down somewhere you can reference quickly

---

## 4. Fund both accounts with TestNet ALGO

ALGO (the native token) is needed on both accounts to pay transaction fees, separately from the
USDC that actually gets transferred as payment.

- [ ] Fund the payer: https://lora.algokit.io/testnet/fund
- [ ] Fund the receiver the same way
- [ ] Confirm both show a nonzero ALGO balance on Lora

---

## 5. Opt both accounts into TestNet USDC

This is the step people forget, and it's the #1 cause of "payment failed with an asset error."

- [ ] On Lora, open the payer account → find the asset opt-in option → opt into TestNet-USDC
- [ ] Repeat for the receiver account
- [ ] Get actual TestNet USDC into the payer's account (the one that needs to *spend* it) via the
      Circle faucet: https://faucet.circle.com/ → select "Algorand Testnet" → paste payer address
- [ ] Confirm the payer shows a nonzero USDC balance on Lora before moving on

---

## 6. Clone the starter template

- [ ] `git clone https://github.com/SomehowLiving/x402-commerce-template`
- [ ] `cd x402-commerce-template`
- [ ] `pnpm install`
- [ ] `cp .env.example .env`
- [ ] Fill in `.env`:
  ```
  ALGORAND_NETWORK=testnet
  PAY_TO_ADDRESS=<receiver public address>
  CLIENT_MNEMONIC="<payer 25-word mnemonic>"
  WALLET_ADDRESS=<any valid testnet address>
  DEMO_MODE=true
  ```
- [ ] Open `AGENTS.md`, `skills.md`, `PROJECT_BRIEF.md`,
      `docs/resources/X402_PRIMER.md`, `docs/resources/IMPLEMENTATION_MAP.md` — skim once, you'll
      reference these again when you start writing ADSEC logic

---

## 7. Run it locally and prove the payment rail actually works

- [ ] `pnpm dev` → confirm it starts, open `http://localhost:3000`
- [ ] `pnpm client:unpaid` → you should get a `402 Payment Required` response back — this
      confirms the payment gate is active
- [ ] `pnpm client:paid` → this should sign a real payment, submit it through the facilitator,
      settle it on-chain, and return actual data — this confirms the *entire* rail end to end
- [ ] Cross-check the transaction actually happened: https://facilitator.goplausible.xyz/dashboard
- [ ] Cross-check it again on Lora directly — paste the receiver address into
      https://lora.algokit.io/testnet and confirm you see the incoming transaction. This is the
      exact verification method the hackathon judges said they'll use, so get comfortable finding
      it now.

**If this step works, the infrastructure is done.** Everything past this point is deployment and
external-service accounts — no more blockchain risk.

---

## 8. Confirm the x402/Algorand dependencies are real (judges check this directly)

- [ ] Open `package.json` in the cloned repo, confirm you see actual `@x402-avm/*` packages
      listed as dependencies (not just the word "x402" mentioned in a README)
- [ ] If for some reason they're missing, check the Algorand x402 guide for the correct package
      names: https://dev.algorand.co/resources/x402-on-algorand/

---

## 9. Set up external accounts you'll need before writing ADSEC logic

None of these require code yet — just get the accounts/keys ready so Day 2 isn't a fire drill.

- [ ] **GitHub personal access token** — Settings → Developer settings → Personal access tokens →
      generate one with just public-repo read scope. Bumps the GitHub API rate limit from 60/hr
      (enough to get rate-limited mid-demo) to 5,000/hr. Store it in `.env`, never commit it.
- [ ] **LLM API key** (whichever provider you're using for the eventual semantic-review tier) —
      set a small usage budget (a few dollars covers testing + demo day). Store in `.env`.
- [ ] Confirm `.env` is in `.gitignore` before you commit anything to the repo — check right now:
      `cat .gitignore | grep .env`

---

## 10. Choose your hosting target now (don't decide this later)

- [ ] Create a free account on Render (https://render.com) or Railway (https://railway.app) —
      whichever you're more comfortable with, doesn't matter much which
- [ ] Don't deploy yet — just confirm the account exists and you know how to connect a GitHub repo
      to it, so Day 2's deploy step is "click connect" not "learn a new platform under time
      pressure"
- [ ] Note for later: free tiers spin down after ~15 min idle, ~30–50s cold start on next request
      — plan a keep-alive ping (cron-job.org) for demo windows once deployed

---

## Setup complete when:

- [ ] `pnpm client:paid` settles a real payment and returns data
- [ ] That transaction is visible on both the GoPlausible dashboard and Lora
- [ ] `package.json` shows real `@x402-avm` dependencies
- [ ] GitHub token, LLM key, and hosting account all exist and are ready
- [ ] Nothing sensitive (mnemonics, keys) is anywhere near git

At this point you have zero blockchain-plumbing risk left. Everything from here is writing
ADSEC's actual audit logic inside a route that already works.
