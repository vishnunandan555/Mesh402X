# ADSEC — Build Plan (Aug 21–22)

## The pitch, reframed (say this, not the original submission's framing)

We are **not** building a universal agent network — that already exists: the x402 protocol +
Algorand + the GoPlausible facilitator + the Bazaar discovery layer together *are* that network.
We built **ADSEC**, a real, useful, pay-per-call code security audit service, and deployed it as a
compliant node on that existing open network — proving the "any service can plug in" vision by
actually doing it, honestly, rather than re-architecting infrastructure that's already solved.

**Open item — resolve in the WhatsApp group before you touch Day 2:** TestNet or MainNet?
<cite>Rules just say "deployed on Algorand."</cite> TestNet = free, zero risk, what this plan
assumes. MainNet = real (tiny) USDC, required if this also needs to count toward the separate
Algorand Foundation Global x402 Challenge leaderboard. Ask today.

---

## What ADSEC actually is (final feature scope)

One HTTP server (built on the `x402-commerce-template`), one paid endpoint,
`POST /api/adsec/audit`, taking `{ code, language, tier }` and returning structured findings.
No repo cloning, no CVE exploit execution, no arbitrary-URL fetching of untrusted targets — those
are cut for real safety/legal/time reasons discussed already, not just "nice to have later."

**Tier 1 — cheap, deterministic, no LLM, no external cost beyond hosting:**
1. Dependency → CVE lookup via OSV.dev (free public API)
2. Line-level correlation — flag the actual line calling a vulnerable function, not just "package X is affected"
3. Severity ranking + dedup — cut noise down to what's actually exploitable
4. Hardcoded secret/credential regex scan
5. Dangerous-pattern scan — `eval`/`exec`, string-built SQL, insecure deserialization, weak hashing
6. Typosquat dependency check — edit-distance against popular package names
7. Outdated/abandoned dependency flag — via PyPI/npm registry APIs

**Tier 2 — needs an LLM call, costs real (small) money per call, justifies higher price:**
8. Semantic/logic-level review — LLM catches what regex can't (auth bypass, broken access control)
9. Fix generation as a diff, not prose — directly usable by a calling agent

**Stretch, only if Tier 1+2 are rock solid with time to spare:**
10. Repo-wide analysis via **GitHub API** (read-only `contents` endpoint — no cloning, no execution)
11. PR-diff mode — audit only changed lines of a git diff (best "agentic" pitch line, even half-built)
12. On-chain audit receipt — surface the settled tx ID in the response (free, just say it in the pitch)

Build order matters: **1 → 4,5,6,7 → 2,3 → 8,9 → 10 → 11.** Items 4–7 are nearly free to add once
you've built the pipeline for #1, so bundle them together. #2/#3 (correlation + ranking) are your
actual differentiator versus a thin CVE wrapper — don't skip them to rush to the LLM tier.

---

## Hosting — settled, no more back-and-forth

**Render or Railway free tier. Not your laptop, not n8n.** Both handle everything above —
1–7, 10–12 are pure computation or free-API calls; 8–9 just make an outbound HTTPS call to an LLM
API, your server does no heavy lifting itself. n8n is workflow automation, not an HTTP framework
that can return precise `402` status codes with x402 payment headers — wrong tool for the core
server, keep it out of scope entirely.

**One real gotcha to plan around:** free-tier Render spins down after ~15 min idle, with a
30–50s cold-start on the next request. Set up a free keep-alive ping (cron-job.org hitting your
health endpoint every ~10 min) for your active testing/demo windows, or just be ready to tell
whoever's testing it "first call takes a few seconds to wake up."

---

## DAY 1 — Aug 21 (today)

### 1. Environment (15 min)
- [ ] Node.js LTS, `pnpm` (`npm i -g pnpm`)

### 2. Two testnet accounts (30 min) — skip/adjust if group says MainNet
- [ ] Create both via Lora: https://lora.algokit.io/testnet
- [ ] Fund both with testnet ALGO: https://lora.algokit.io/testnet/fund
- [ ] Opt **both** accounts into testnet USDC (the Algorand-specific gotcha — both, not just receiver)
- [ ] Get testnet USDC on both from Circle faucet: https://faucet.circle.com/ (select "Algorand Testnet")
- [ ] Save payer's mnemonic locally (never git), receiver's public address

### 3. Clone template, prove the payment rail works end to end (60–90 min)
```
git clone https://github.com/SomehowLiving/x402-commerce-template
cd x402-commerce-template
pnpm install
cp .env.example .env
```
Fill `.env`: `ALGORAND_NETWORK`, `PAY_TO_ADDRESS`, `CLIENT_MNEMONIC`, `WALLET_ADDRESS`, `DEMO_MODE=true`
- [ ] `pnpm dev` → `http://localhost:3000`
- [ ] `pnpm client:unpaid` → confirm 402
- [ ] `pnpm client:paid` → confirm payment settles, real data comes back
- [ ] Check the transaction shows on https://facilitator.goplausible.xyz/dashboard

**Milestone: if `pnpm client:paid` works, the entire risky part is proven. Everything left is
normal backend dev.**

### 4. Read (30–45 min, do while faucets/installs are running)
- [ ] `AGENTS.md`, `skills.md`, `PROJECT_BRIEF.md`, `docs/resources/X402_PRIMER.md`,
      `docs/resources/IMPLEMENTATION_MAP.md` in the cloned repo
- [ ] Fill `PROJECT_BRIEF.md` with the ADSEC scope above

### 5. Get external API access sorted (20 min)
- [ ] Generate a free GitHub personal access token (bumps API rate limit from 60/hr to 5,000/hr —
      needed later even for Tier-1-adjacent lookups, set it up now so it's not a Day-2 fire drill)
- [ ] Get an LLM API key (whichever provider you're using for Tier 2) and set a small budget —
      a few dollars covers testing + demo day for Tier 2 calls

### 6. Build Tier 1, rules 4–7 (remaining time today)
- [ ] Write the regex/pattern engine as plain functions — no framework needed
- [ ] Secret scan, dangerous-pattern scan, typosquat check, outdated-dependency check
- [ ] Test against a few code snippets you write yourself with known issues planted in them
- [ ] Don't wire into the template's route yet — just get the logic correct in isolation first

---

## DAY 2 — Aug 22

### Morning: CVE lookup + correlation + ranking (3–4 hrs)
- [ ] Wire up OSV.dev calls: parse `requirements.txt`/`package.json`, query per package
- [ ] Build line-level correlation — grep/AST-walk for actual call sites of flagged functions,
      not just "package present" (this is the part that makes ADSEC more than a CVE wrapper)
- [ ] Severity ranking + dedup on the combined result set
- [ ] Combine with yesterday's Tier 1 rules into one unified findings pipeline

### Midday: LLM tier (2 hrs)
- [ ] Structured prompt for semantic review — force JSON output (findings, severity, line, fix)
- [ ] Fix-generation as a diff/patch snippet, not a paragraph
- [ ] Test for output consistency — run it a few times, make sure the schema holds

### Afternoon: wire into the template + deploy (2–3 hrs)
- [ ] Replace `src/routes/wallet.ts` with `/api/adsec/audit`, tier param controls which checks run
- [ ] Update `src/x402/config.ts`: two price points (Tier 1 cheap, Tier 2 pricier — reflects real
      compute-cost difference, mention this in the pitch), Bazaar discovery metadata (description,
      example input/output)
- [ ] Update `client/lib.ts` + demo clients to call your endpoint with a real code sample
- [ ] Update `src/web/*` dashboard to display the audit report — this is your live-demo screen
- [ ] `pnpm build`, `pnpm test`, `pnpm smoke`, `pnpm x402 checklist` — fix what breaks
- [ ] Deploy to Render or Railway, point env vars at it
- [ ] Re-run the full flow against the **public URL**, not localhost — confirm 402 → pay → 200
- [ ] Verify Bazaar indexing:
      `curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000" | jq '.items[] | select(.resourceUrl | contains("your-domain"))'`
- [ ] Set up the keep-alive ping for demo windows

### Evening: stretch + rehearsal (remaining time)
- [ ] If time: repo-wide GitHub API mode (#10), PR-diff mode (#11) — only after everything above
      is solid, don't trade a working core for an unfinished stretch feature
- [ ] Full dry run: unpaid call → 402 → agent pays → gets real audit report, on the public URL
- [ ] Record a backup demo clip of the flow working (faucets/wifi fail at events, always have this)
- [ ] Prep the pitch: problem → ADSEC as one real service on the existing open network → live demo
      → why tiers are priced differently (real compute cost) → on-chain receipt as proof-of-audit →
      roadmap slide for repo-mode/PR-diff/anything cut, framed honestly as future work

---

## Resources
- x402 docs: https://docs.x402.org/introduction
- Algorand x402 guide: https://dev.algorand.co/resources/x402-on-algorand/
- Template repo: https://github.com/SomehowLiving/x402-commerce-template
- GoPlausible facilitator dashboard: https://facilitator.goplausible.xyz/dashboard
- OSV.dev API: https://osv.dev
- Lora (wallet + faucet + explorer): https://lora.algokit.io/testnet
- Circle testnet USDC faucet: https://faucet.circle.com/
