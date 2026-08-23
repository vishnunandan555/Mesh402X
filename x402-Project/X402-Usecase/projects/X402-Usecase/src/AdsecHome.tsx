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
    accent: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
    body: 'Submit source code over HTTP. No accounts, API tokens, or upfront subscriptions required — the request pays for itself.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "py" }',
  },
  {
    step: '02',
    glyph: '[$]',
    title: 'Authorize Micropayment',
    accent: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
    body: 'The server challenges with HTTP 402 Payment Required. Sign a $0.001 TestNet USDC transfer in your Algorand wallet.',
    code: 'HTTP/1.1 402 PAYMENT REQUIRED\nX-PRICE: 0.001 USDC (ASA#10458941)',
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
    <div className="bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-[380px] h-[380px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-14 lg:pt-24 lg:pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ALGORAND TESTNET ACTIVE
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                X402 PROTOCOL
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
                ZERO SUBSCRIPTIONS
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08]">
              Autonomous code security.
              <br />
              <span className="text-gradient">Instant on-chain settlement.</span>
            </h1>

            <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Medusa lets AI agents and developers audit source code, generate ready-to-merge patches, and record cryptographic proof on Algorand — charged per request at $0.001 USDC via HTTP 402.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <a
                href="#playground"
                onClick={() => setCurrentView('playground')}
                className="px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-white"
              >
                Run an audit ↓
              </a>
              <button
                onClick={() => {
                  setCurrentView('ledger')
                  document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`px-5 py-3.5 rounded-xl font-bold font-mono text-sm border transition-all ${
                  currentView === 'ledger'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900 text-slate-300'
                }`}
              >
                📜 Audit Ledger
              </button>
              <a
                href="#pipeline"
                className="px-6 py-3.5 rounded-xl font-bold border border-slate-700 hover:border-slate-500 hover:bg-slate-900 transition-all text-slate-300"
              >
                How it works
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l-2 border-slate-800 pl-3">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl font-black text-white">{s.value}</dd>
                  <dd className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-float-y">
            <AsciiTerminal title="Security Node — Live Telemetry" phase="idle" />
            <p className="mt-3 text-center text-[11px] font-mono text-slate-500 uppercase tracking-widest">
              Live service status · interactive test environment below ↓
            </p>
          </div>
        </div>
      </section>

      {/* THREAT TICKER */}
      <section aria-label="Detected vulnerability categories" className="border-y border-slate-800/80 bg-slate-950 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {THREATS.map((t) => (
                <span key={`${copy}-${t}`} className="mx-6 text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-6">
                  {t}
                  <span className="text-indigo-500">//</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 py-20 scroll-mt-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400 mb-3">Protocol Sequence</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Three steps from request to verified fix</h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Every audit follows a deterministic verification lifecycle settled directly on Algorand.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] border-t border-dashed border-slate-800 -z-0"></div>
          {PIPELINE.map((p) => (
            <div key={p.step} className="relative z-10 bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-sm px-2.5 py-1 rounded-lg border ${p.accent}`}>{p.glyph}</span>
                <span className="text-4xl font-black text-slate-800 select-none">{p.step}</span>
              </div>
              <h3 className="font-bold text-lg text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
              <pre className="mt-4 text-[11px] font-mono text-emerald-300/90 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto thin-scroll">
{p.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ENDPOINTS */}
      <section id="endpoints" className="border-t border-slate-800/60 bg-slate-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">Available Endpoints</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Pick a service to inspect</h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">Each endpoint is a dedicated x402 resource with fixed, transparent pricing.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENDPOINT_ORDER.map((key) => {
              const meta = ENDPOINTS_META[key]
              return (
                <button
                  key={key}
                  onClick={() => handleSelectEndpoint(key)}
                  className="group text-left bg-slate-900/70 border border-slate-800 rounded-2xl p-5 transition-all hover:border-indigo-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">{meta.cardBadge}</span>
                    <span className="text-xs font-mono font-black text-amber-300">{meta.price}</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">{meta.name}</div>
                  <code className="block mt-1 text-[11px] font-mono text-slate-500">{meta.path}</code>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">{meta.desc}</p>
                  <span className="inline-block mt-4 text-[11px] font-mono text-indigo-400 group-hover:text-indigo-300">
                    Open in editor →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLAYGROUND & LEDGER */}
      <section id="playground" className="border-t border-slate-800/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-3">
                {currentView === 'playground' ? 'Interactive Workspace' : 'On-Chain Ledger'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {currentView === 'playground' ? 'Run a Security Audit' : 'Algorand TestNet Ledger'}
              </h2>
              <p className="mt-3 text-slate-400 max-w-xl">
                {currentView === 'playground'
                  ? 'Choose a code preset or write your own to run a live scan, negotiate an x402 payment challenge, and generate verified patches.'
                  : 'Immutable record of verified x402 payment settlements and SHA-256 code attestations on Algorand TestNet.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono font-bold">
                <button
                  onClick={() => setCurrentView('playground')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'playground' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interactive Auditor
                </button>
                <button
                  onClick={() => setCurrentView('ledger')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentView === 'ledger' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📜 On-Chain Ledger
                </button>
              </div>

              <div className="text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 shrink-0 hidden md:block">
                <div>target : <span className="text-slate-300">{`${import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'}`}</span></div>
                <div className="mt-1">network : <span className="text-emerald-400">algorand testnet</span></div>
              </div>
            </div>
          </div>

          {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-black text-xs text-white">
                🐍
              </div>
              <div className="font-black text-white tracking-wide">MEDUSA<span className="text-indigo-400">.</span></div>
              <span className="text-xs font-mono text-slate-500">v1.0.0 · TestNet</span>
            </div>
            <p className="mt-2 text-slate-500 text-xs leading-relaxed max-w-xs">
              Autonomous security node for machine-to-machine commerce. Powered by the x402 open standard on Algorand.
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-slate-600 mb-3">Protocol & Explorer</div>
            <a className="block text-slate-400 hover:text-indigo-300 transition-colors" href="https://www.x402.org" target="_blank" rel="noreferrer">x402 Specification ↗</a>
            <a className="block text-slate-400 hover:text-indigo-300 transition-colors" href="https://lora.algokit.io/testnet" target="_blank" rel="noreferrer">Algorand Lora Explorer ↗</a>
            <a className="block text-slate-400 hover:text-indigo-300 transition-colors" href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer">GoPlausible Facilitator ↗</a>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-slate-600 mb-3">Service Status</div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Accepting requests
            </div>
            <div className="text-slate-600">Settlement: GoPlausible Facilitator</div>
            <div className="text-slate-600">Asset: TestNet USDC (ASA#10458941)</div>
          </div>
        </div>

        <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 font-mono">
          © 2026 Medusa Security Labs — Live on Algorand TestNet · x402 Protocol
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
