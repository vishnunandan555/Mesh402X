import React, { useState, useEffect } from 'react'
import { IconScan, IconFileDiff, IconShieldCheck, IconVault, IconLedger, IconCopy, IconCheck, IconArrowRight, IconGlobe } from './icons'

const TIERS = [
  {
    id: 'scan',
    name: 'Pre-flight scanner',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/scan',
    script: 'npx tsx medusa-scripts/audit-scan.ts <file>',
    badge: 'fast · deterministic',
    Icon: IconScan,
    description: 'Scans for hardcoded secrets, AST hazard patterns, typosquatted dependency packages, and live OSV.dev CVE matches.',
  },
  {
    id: 'remediate',
    name: 'Auto-remediator',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/remediate',
    script: 'npx tsx medusa-scripts/audit-remediate.ts <file>',
    badge: 'git diff patch',
    Icon: IconFileDiff,
    description:
      'Generates language-aware unified git diffs that apply cleanly with `git apply audit.patch` to fix security flaws automatically.',
  },
  {
    id: 'attest',
    name: 'On-chain attestation',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/attest',
    script: 'npx tsx medusa-scripts/audit-attest.ts <file>',
    badge: 'algorand proof',
    Icon: IconShieldCheck,
    description:
      'Computes a cryptographic SHA-256 code hash and broadcasts an immutable proof-of-audit transaction note on Algorand TestNet.',
  },
  {
    id: 'audit',
    name: 'Full audit suite',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/audit',
    script: 'npx tsx medusa-scripts/audit-full.ts <file>',
    badge: 'complete pipeline',
    recommended: true,
    Icon: IconVault,
    description: 'Deterministic scan + LLM logic review + unified git diffs + verifiable on-chain attestation, end to end.',
  },
  {
    id: 'history',
    name: 'Financial ledger & history',
    price: 'free query',
    endpoint: 'Algorand TestNet Indexer',
    script: 'npx tsx medusa-scripts/wallet-history.ts',
    badge: 'spending history',
    Icon: IconLedger,
    description: 'Queries Algorand to display on-chain audit micropayments, attestation receipts, and total USDC spent.',
  },
]

export const AgentGuidePage: React.FC<{ onSwitchToPlayground: () => void }> = ({ onSwitchToPlayground }) => {
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [activeTab, setActiveTab] = useState<'install' | 'agent' | 'bazaar' | 'architecture'>('install')
  const [bazaarStatus, setBazaarStatus] = useState<{ loading: boolean; count?: number; verified?: boolean; error?: string }>({
    loading: true,
  })

  useEffect(() => {
    // Check live GoPlausible Bazaar registry status
    fetch('https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000')
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || data.resources || []
        const hasMedusa = items.some(
          (i: unknown) => JSON.stringify(i).toLowerCase().includes('adsec') || JSON.stringify(i).includes('mesh402x'),
        )
        setBazaarStatus({
          loading: false,
          count: items.length || undefined,
          verified: hasMedusa,
        })
      })
      .catch(() => {
        setBazaarStatus({ loading: false, error: 'Registry unreachable' })
      })
  }, [])

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash')
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2500)
  }

  const copyPromptText = () => {
    navigator.clipboard.writeText(
      'Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof.',
    )
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2500)
  }

  return (
    <div className="max-w-shell mx-auto px-4 sm:px-6 py-12 space-y-20">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-base-800 bg-base-900/50 p-8 sm:p-14 shadow-pop">
        <div
          className="absolute -top-48 -right-24 w-[480px] h-[480px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,185,138,0.14), transparent 65%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono bg-accent/[0.08] text-accent border border-accent/35">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              agent-to-agent · active
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-base-950 text-base-300 border border-base-700">x402 standard</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono text-base-400 border border-base-800">algorand testnet</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.06] text-base-50">
            How any external AI agent discovers &amp; hires Medusa
          </h1>

          <p className="mt-5 text-base-400 text-base sm:text-lg leading-relaxed max-w-[62ch]">
            No accounts, no API keys, no subscriptions. Autonomous agents discover Medusa on the decentralized GoPlausible Bazaar, pay
            $0.001 USDC via HTTP 402, receive AST/CVE diagnostics, and apply git patches automatically.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4 items-center">
            <button
              onClick={copyInstallCommand}
              className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus-ring flex items-center gap-2 ${
                copiedInstall ? 'bg-accent-bright text-base-ink shadow-glow' : 'bg-accent hover:bg-accent-bright text-base-ink shadow-glow'
              }`}
            >
              {copiedInstall ? <IconCheck size={15} /> : <IconCopy size={15} />}
              <span>{copiedInstall ? 'Installer copied' : 'Copy one-line installer'}</span>
            </button>
            <button
              onClick={onSwitchToPlayground}
              className="px-5 py-3 rounded-xl font-medium text-sm border border-base-700 hover:border-base-500 hover:bg-white/[0.04] transition-all duration-200 active:scale-[0.98] focus-ring text-base-200 flex items-center gap-2"
            >
              Try the web playground
              <IconArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ONE-LINE INSTALLER */}
      <section className="rounded-2xl border border-base-800 bg-base-900/60 p-6 sm:p-8 shadow-node">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-base-100">One-line universal installer</h2>
            <p className="text-xs sm:text-sm text-base-400 mt-1.5 max-w-xl">
              Run this in any repository to install x402 dependencies, the modular audit scripts, and the agent skill manifest.
            </p>
          </div>
          <button
            onClick={copyInstallCommand}
            className="px-4 py-2 rounded-lg text-xs font-mono font-medium bg-accent/10 text-accent border border-accent/40 hover:bg-accent hover:text-base-ink transition-all duration-200 active:scale-[0.98] focus-ring flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            {copiedInstall ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copiedInstall ? 'Copied' : 'Copy command'}
          </button>
        </div>

        <div className="rounded-xl bg-base-ink border border-base-800 p-4 font-mono text-xs sm:text-sm text-accent overflow-x-auto thin-scroll select-all tnum">
          curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
        </div>

        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-base-400">
          <li className="flex items-start gap-2 bg-base-950/70 p-3 rounded-lg border border-base-800">
            <IconCheck size={13} className="text-accent shrink-0 mt-0.5" />
            <span>
              Installs <code className="text-accent">@x402-avm/fetch</code> &amp; <code className="text-accent">algosdk</code>
            </span>
          </li>
          <li className="flex items-start gap-2 bg-base-950/70 p-3 rounded-lg border border-base-800">
            <IconCheck size={13} className="text-accent shrink-0 mt-0.5" />
            <span>
              Sets up <code className="text-accent">medusa-scripts/</code> &amp; <code className="text-accent">.env</code>
            </span>
          </li>
          <li className="flex items-start gap-2 bg-base-950/70 p-3 rounded-lg border border-base-800">
            <IconCheck size={13} className="text-accent shrink-0 mt-0.5" />
            <span>
              Configures <code className="text-accent">Medusa_Skill.md</code> for your agent
            </span>
          </li>
        </ul>
      </section>
      {/* INTERACTIVE GUIDE TABS */}
      <section className="space-y-8">
        <div className="flex border-b border-base-800 overflow-x-auto gap-1 thin-scroll">
          {(
            [
              { id: 'install', label: 'How it works' },
              { id: 'agent', label: 'Tiers & pricing' },
              { id: 'bazaar', label: 'Bazaar discovery' },
              { id: 'architecture', label: 'Prompting your agent' },
            ] as const
          ).map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-selected={activeTab === t.id}
              role="tab"
              className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 focus-ring ${
                activeTab === t.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-base-400 hover:text-base-200 hover:border-base-600'
              }`}
            >
              <span className="font-mono text-base-600 mr-2 tnum">0{i + 1}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: AGENT-TO-AGENT WORKFLOW — open flow, no card boxes */}
        {activeTab === 'install' && (
          <div className="relative">
            <div className="hidden md:block absolute top-[22px] left-[6%] right-[6%] h-px bg-base-800" aria-hidden="true"></div>
            <ol className="relative grid md:grid-cols-3 gap-10 md:gap-8">
              {[
                {
                  n: '01',
                  title: 'Autonomous discovery',
                  body: 'The external agent queries the GoPlausible Bazaar registry at runtime. It finds Medusa’s endpoint, inspects OpenAPI schemas, and matches capability without hardcoded URLs.',
                  code: 'GET /discovery/resources → Medusa node ($0.001)',
                },
                {
                  n: '02',
                  title: 'x402 micropayment',
                  body: 'Medusa returns an HTTP 402 challenge. The agent’s local wallet signs the $0.001 USDC Algorand transaction in code in roughly half a second — no popups.',
                  code: 'HTTP 402 → sign 1,000 microUSDC → settle',
                },
                {
                  n: '03',
                  title: 'Auto-patch & attestation',
                  body: 'Medusa replies with findings, a health score, and unified git diffs. The agent applies `git apply audit.patch` to self-heal the codebase with on-chain proof.',
                  code: '200 OK → score 95/100 → Lora TxID',
                },
              ].map((s) => (
                <li key={s.n}>
                  <span className="relative z-10 w-11 h-11 rounded-xl bg-base-900 border border-base-700 flex items-center justify-center font-mono text-sm text-accent tnum shadow-node">
                    {s.n}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-base-100">{s.title}</h3>
                  <p className="mt-2 text-xs text-base-400 leading-relaxed max-w-[44ch]">{s.body}</p>
                  <div className="mt-4 inline-block p-3 rounded-lg bg-base-ink border border-base-800 font-mono text-[11px] text-accent/90 tnum">
                    {s.code}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* TAB 2: TIERS & PRICING */}
        {activeTab === 'agent' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col ${
                  tier.recommended
                    ? 'border-accent/45 bg-accent/[0.05] shadow-glow'
                    : 'border-base-800 bg-base-900/60 hover:border-base-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                        tier.recommended ? 'bg-accent/15 border-accent/40 text-accent' : 'bg-base-950 border-base-700 text-base-300'
                      }`}
                    >
                      <tier.Icon size={17} />
                    </span>
                    <h3 className="font-display font-semibold text-base-100">{tier.name}</h3>
                  </div>
                  {tier.recommended && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-accent/50 bg-accent/10 text-accent shrink-0">
                      recommended
                    </span>
                  )}
                </div>

                <span className="self-start text-[10px] font-mono px-2 py-0.5 rounded border border-base-700 text-base-400 mb-3 lowercase tracking-wide">
                  {tier.badge}
                </span>

                <p className="text-xs text-base-400 leading-relaxed mb-5">{tier.description}</p>

                <div className="mt-auto space-y-2 pt-4 border-t border-base-800/80">
                  <div className="flex items-center justify-between text-xs font-mono tnum">
                    <span className="text-base-500">Price per call</span>
                    <span className={`font-semibold ${tier.recommended || tier.price !== '$0.001 USDC' ? 'text-accent' : 'text-base-200'}`}>
                      {tier.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono tnum">
                    <span className="text-base-500">Endpoint</span>
                    <span className="text-base-300">{tier.endpoint}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-base-ink border border-base-800 font-mono text-[11px] text-base-300 overflow-x-auto thin-scroll">
                    {tier.script}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BAZAAR DISCOVERY */}
        {activeTab === 'bazaar' && (
          <div className="rounded-2xl border border-base-800 bg-base-900/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-base-100 flex items-center gap-2.5">
                  <IconGlobe size={18} className="text-accent" />
                  Live GoPlausible Bazaar registry
                </h3>
                <p className="text-xs text-base-400 mt-1.5 max-w-lg">
                  The public catalog where autonomous agents discover Medusa capabilities.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-ink border border-base-800 text-xs font-mono tnum self-start">
                {bazaarStatus.loading ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-base-500 animate-pulse"></span> Querying registry…
                  </>
                ) : bazaarStatus.error ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="text-amber-300/90">{bazaarStatus.error} — record below is the last known registration</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    {bazaarStatus.count ?? '?'} nodes active{bazaarStatus.verified ? ' · Medusa listed' : ''}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-base-ink border border-base-800 p-4 font-mono text-xs text-base-300 space-y-3">
              <div className="text-base-600"># query the decentralized discovery catalog</div>
              <div className="text-accent overflow-x-auto thin-scroll whitespace-nowrap">
                curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000"
              </div>

              <div className="pt-2 border-t border-base-800/80 text-base-400">
                <div className="text-accent font-medium mb-1.5 flex items-center gap-1.5">
                  <IconCheck size={12} /> Registered record
                </div>
                <pre className="text-[11px] text-base-300 overflow-x-auto thin-scroll bg-base-950/80 p-3 rounded-lg border border-base-800 tnum">
                  {`{
  "resourceUrl": "https://mesh402x.onrender.com/adsec/audit",
  "method": "POST",
  "description": "ADSEC Full Security Audit Suite ($0.001 USDC)",
  "accepts": [{
    "scheme": "exact",
    "network": "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
    "amount": "1000",
    "asset": 10458941,
    "payTo": "LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ"
  }]
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROMPTING YOUR AGENT */}
        {activeTab === 'architecture' && (
          <div className="rounded-2xl border border-base-800 bg-base-900/60 p-6 space-y-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-base-100">How to prompt your AI assistant</h3>
              <p className="text-xs text-base-400 mt-1.5 max-w-xl">
                Once <code className="text-accent">install.sh</code> has run, prompt Antigravity, Cursor, or Claude Code in plain English.
              </p>
            </div>

            <div className="rounded-xl bg-base-ink border border-base-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-base-500 tracking-wide">Example chat prompt</span>
                <button
                  onClick={copyPromptText}
                  className="text-xs font-mono text-accent hover:text-accent-bright transition-colors duration-200 focus-ring rounded-sm flex items-center gap-1.5"
                >
                  {copiedPrompt ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  {copiedPrompt ? 'Copied' : 'Copy prompt'}
                </button>
              </div>
              <blockquote className="font-mono text-sm text-accent bg-base-950 p-3.5 rounded-lg border border-base-800 select-all">
                “Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof.”
              </blockquote>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-base-950/60 border border-base-800">
                <div className="font-semibold text-base-100 mb-2.5">What the agent does</div>
                <ul className="space-y-1.5 text-base-400">
                  {[
                    'Reads `Medusa_Skill.md`',
                    'Executes the right modular script',
                    'Signs $0.001 USDC in code',
                    'Applies git diff patches',
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-2">
                      <span className="text-accent mt-px">·</span>
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-base-950/60 border border-base-800">
                <div className="font-semibold text-base-100 mb-2.5">What you receive</div>
                <ul className="space-y-1.5 text-base-400">
                  {[
                    'Health score (0–100)',
                    'Categorized CVE & AST findings',
                    'Verified Lora explorer transaction link',
                    'Self-healed clean repository',
                  ].map((li) => (
                    <li key={li} className="flex items-start gap-2">
                      <span className="text-accent mt-px">·</span>
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* STAT STRIP */}
      <section className="border-t border-base-800 pt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        {[
          { v: '$0.001', l: 'per paid audit' },
          { v: '< 1.5s', l: 'on-chain settlement' },
          { v: '0', l: 'API keys or logins' },
          { v: 'SHA-256', l: 'attestation standard' },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-display text-2xl font-semibold text-base-100 tnum">{s.v}</div>
            <div className="mt-1 text-[11px] font-mono text-base-500 lowercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default AgentGuidePage
