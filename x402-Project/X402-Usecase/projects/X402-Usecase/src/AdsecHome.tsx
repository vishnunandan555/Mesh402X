import React, { useState } from 'react'
import AsciiTerminal from './components/AsciiTerminal'
import AdsecPlayground from './components/AdsecPlayground'
import OnChainLedger from './components/OnChainLedger'
import { ENDPOINTS_META, ENDPOINT_ORDER, setAdsecMode, EndpointMode } from './utils/adsecEndpoints'

const THREATS = [
  'SQL Injection',
  'Command Injection',
  'Hardcoded Secrets',
  'XSS / Eval Sinks',
  'Typosquatted Packages',
  'Insecure Deserialization',
  'Unchecked ASA Opt-In',
  'OSV.dev Vulnerabilities',
]

const PIPELINE = [
  {
    step: '01',
    glyph: '>_',
    title: 'Send Code',
    accent: 'text-white border-white/25 bg-white/10',
    body: 'Submit source code over HTTP. No accounts, API tokens, or upfront subscriptions required — the request pays for itself.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "py" }',
  },
  {
    step: '02',
    glyph: '[$]',
    title: 'Authorize Micropayment',
    accent: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
    body: 'The server challenges with HTTP 402 Payment Required. Sign a $0.001 TestNet USDC transfer in your Algorand wallet.',    code: 'HTTP/1.1 402 PAYMENT REQUIRED\nX-PRICE: 0.001 USDC (ASA#10458941)',
  },
  {
    step: '03',
    glyph: '{=}',
    title: 'Receive Patches & Proof',
    accent: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    body: 'Once payment settles on Algorand, receive AST diagnostics, ready-to-apply git diffs, and an immutable SHA-256 attestation.',
    code: '200 OK -> findings[] fixes[] attestation',
  },
]

const STATS = [
  { value: '$0.001', label: 'Per Audit Call' },
  { value: '< 2s', label: 'Turnaround Time' },
  { value: '100%', label: 'On-Chain Verified' },
  { value: '0', label: 'Subscriptions or Keys' },
]

export const AdsecHome: React.FC = () => {
  const [currentView, setCurrentView] = useState<'playground' | 'ledger'>('playground')

  const handleSelectEndpoint = (mode: EndpointMode) => {
    setAdsecMode(mode)
    setCurrentView('playground')
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-black text-neutral-100">
      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-emerald-600/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-[380px] h-[380px] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-14 lg:pt-24 lg:pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ALGORAND TESTNET ACTIVE
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white">
                X402 PROTOCOL
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-neutral-400">
                ZERO SUBSCRIPTIONS
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08]">
              Autonomous code security.
              <br />
              <span className="text-gradient">Instant on-chain settlement.</span>
            </h1>

            <p className="mt-6 text-neutral-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Medusa lets AI agents and developers audit source code, generate ready-to-merge patches, and record cryptographic proof on Algorand — charged per request at $0.001 USDC via HTTP 402.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <a
                href="#playground"
                onClick={() => setCurrentView('playground')}
                className="px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                Run an audit ↓
              </a>
              <button
                onClick={() => {
                  setCurrentView('ledger')
                  document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`px-5 py-3.5 rounded-xl font-bold text-sm border transition-all ${
                  currentView === 'ledger'
                    ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300'
                    : 'border-white/15 hover:border-white/30 hover:bg-white/5 text-neutral-200'
                }`}
              >
                📜 Audit Ledger
              </button>
              <a
                href="#pipeline"
                className="px-6 py-3.5 rounded-xl font-bold border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all text-neutral-200"
              >
                How it works
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l-2 border-neutral-800 pl-3">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl font-black text-white">{s.value}</dd>
                  <dd className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-float-y">
            <AsciiTerminal title="Security Node — Live Telemetry" phase="idle" />
            <p className="mt-3 text-center text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
              Live service status · interactive test environment below ↓
            </p>
          </div>
        </div>
      </section>

      {/* THREAT TICKER */}
      <section aria-label="Detected vulnerability categories" className="border-y border-white/10 bg-black py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {THREATS.map((t) => (
                <span key={`${copy}-${t}`} className="mx-6 text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-6">
                  {t}
                  <span className="text-emerald-500">//</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 py-20 scroll-mt-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">Protocol Sequence</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Three steps from request to verified fix</h2>
          <p className="mt-3 text-neutral-400 max-w-2xl mx-auto">
            Every audit follows a deterministic verification lifecycle settled directly on Algorand.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] border-t border-dashed border-neutral-800 -z-0"></div>
          {PIPELINE.map((p) => (
            <div key={p.step} className="relative z-10 bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-white/[0.05] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-sm px-2.5 py-1 rounded-lg border ${p.accent}`}>{p.glyph}</span>
                <span className="text-4xl font-black text-white/10 select-none">{p.step}</span>
              </div>
              <h3 className="font-bold text-lg text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{p.body}</p>
              <pre className="mt-4 text-[11px] font-mono text-emerald-300/90 bg-black border border-white/10 rounded-lg p-3 overflow-x-auto thin-scroll">
{p.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ENDPOINTS */}
      <section id="endpoints" className="border-t border-white/10 bg-black scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">Available Endpoints</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Pick a service to inspect</h2>
            <p className="mt-3 text-neutral-400 max-w-2xl mx-auto">Each endpoint is a dedicated x402 resource with fixed, transparent pricing.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENDPOINT_ORDER.map((key) => {
              const meta = ENDPOINTS_META[key]
              return (
                <button
                  key={key}
                  onClick={() => handleSelectEndpoint(key)}
                  className="group text-left bg-white/[0.03] border border-white/10 rounded-2xl p-5 transition-all hover:bg-white/[0.06] hover:border-emerald-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">{meta.cardBadge}</span>
                    <span className="text-xs font-mono font-black text-amber-300">{meta.price}</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">{meta.name}</div>
                  <code className="block mt-1 text-[11px] font-mono text-neutral-500">{meta.path}</code>
                  <p className="mt-2 text-xs text-neutral-400 leading-relaxed line-clamp-3">{meta.desc}</p>
                  <span className="inline-block mt-4 text-[11px] font-mono text-emerald-400 group-hover:text-emerald-300">
                    Open in editor →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLAYGROUND & LEDGER */}
      <section id="playground" className="border-t border-neutral-800/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">
                {currentView === 'playground' ? 'Interactive Workspace' : 'On-Chain Ledger'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {currentView === 'playground' ? 'Run a Security Audit' : 'Algorand TestNet Ledger'}
              </h2>
              <p className="mt-3 text-neutral-400 max-w-xl">
                {currentView === 'playground'
                  ? 'Choose a code preset or write your own to run a live scan, negotiate an x402 payment challenge, and generate verified patches.'
                  : 'Immutable record of verified x402 payment settlements and SHA-256 code attestations on Algorand TestNet.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs font-bold">
                <button
                  onClick={() => setCurrentView('playground')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'playground' ? 'bg-emerald-500 text-black shadow shadow-emerald-500/25' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Interactive Auditor
                </button>
                <button
                  onClick={() => setCurrentView('ledger')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'ledger' ? 'bg-emerald-500 text-black shadow shadow-emerald-500/25' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  📜 On-Chain Ledger
                </button>
              </div>

              <div className="text-xs font-mono text-neutral-500 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 shrink-0 hidden md:block">
                <div>target : <span className="text-neutral-300">{`${import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'}`}</span></div>
                <div className="mt-1">network : <span className="text-emerald-400">algorand testnet</span></div>
              </div>
            </div>
          </div>

          {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center font-mono font-black text-xs text-white">
                🐍
              </div>
              <div className="font-black text-white tracking-wide">MEDUSA<span className="text-emerald-400">.</span></div>
              <span className="text-xs font-mono text-neutral-500">v1.0.0 · TestNet</span>
            </div>
            <p className="mt-2 text-neutral-500 text-xs leading-relaxed max-w-xs">
              Autonomous security node for machine-to-machine commerce. Powered by the x402 open standard on Algorand.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-neutral-600 mb-3">Protocol & Explorer</div>
            <a className="block text-neutral-400 hover:text-emerald-300 transition-colors" href="https://www.x402.org" target="_blank" rel="noreferrer">x402 Specification ↗</a>
            <a className="block text-neutral-400 hover:text-emerald-300 transition-colors" href="https://lora.algokit.io/testnet" target="_blank" rel="noreferrer">Algorand Lora Explorer ↗</a>
            <a className="block text-neutral-400 hover:text-emerald-300 transition-colors" href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer">GoPlausible Facilitator ↗</a>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-neutral-600 mb-3">Service Status</div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Accepting requests
            </div>
            <div className="text-neutral-600">Settlement: GoPlausible Facilitator</div>
            <div className="text-neutral-600">Asset: TestNet USDC (ASA#10458941)</div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-neutral-500">
          © 2026 Medusa Security Labs — Live on Algorand TestNet · x402 Protocol
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
