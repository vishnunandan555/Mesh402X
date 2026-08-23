import React, { useState } from 'react'
import AsciiTerminal from './components/AsciiTerminal'
import AdsecPlayground from './components/AdsecPlayground'
import OnChainLedger from './components/OnChainLedger'
import { ENDPOINTS_META, ENDPOINT_ORDER, setAdsecMode, EndpointMode } from './utils/adsecEndpoints'

const THREATS = [
  'SQL Injection',
  'Command Injection',
  'Hardcoded Secrets',
  'XSS / Dynamic Eval',
  'Typosquatted Packages',
  'Insecure Deserialization',
  'Unchecked ASA Opt-In',
  'OSV.dev Vulnerabilities',
]

const PIPELINE = [
  {
    step: '01',
    glyph: '>_',
    title: 'Submit Code Payload',
    accent: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
    body: 'Submit source code over HTTP. No accounts, API tokens, or upfront subscriptions required — the request pays for itself.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "python" }',
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
    <div className="bg-slate-950 text-slate-100 space-y-16 pb-12">
      {/* 1. HERO */}
      <section className="relative overflow-hidden pt-12 pb-8 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ALGORAND TESTNET ACTIVE
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                X402 PROTOCOL
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Autonomous code security. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                Instant on-chain settlement.
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Medusa lets AI agents and developers audit source code, generate ready-to-merge patches, and record cryptographic proof on Algorand — charged per request at $0.001 USDC via HTTP 402.
            </p>

            <div className="flex flex-wrap gap-3 items-center pt-1">
              <a
                href="#playground"
                onClick={() => setCurrentView('playground')}
                className="px-6 py-3 rounded-xl font-bold font-mono text-xs bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-white"
              >
                Run Interactive Audit
              </a>
              <button
                onClick={() => setCurrentView('ledger')}
                className="px-6 py-3 rounded-xl font-bold font-mono text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
              >
                View On-Chain Ledger
              </button>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-xl font-black text-white font-mono">{s.value}</dt>
                  <dd className="text-[10px] uppercase text-slate-500 font-mono tracking-wider">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <AsciiTerminal title="Security Node — Live Telemetry" phase="idle" />
          </div>
        </div>
      </section>

      {/* 2. THREAT TICKER */}
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

      {/* 3. SYMMETRIC 3-STEP PIPELINE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-indigo-400 font-bold">[01] Protocol Sequence</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Three Steps to Verified Remediation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PIPELINE.map((p) => (
            <div key={p.step} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs px-2.5 py-0.5 rounded border ${p.accent}`}>{p.glyph}</span>
                <span className="text-2xl font-black text-slate-700 font-mono">{p.step}</span>
              </div>
              <h3 className="font-bold text-white text-base">{p.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{p.body}</p>
              <pre className="text-[10px] font-mono text-emerald-300 bg-slate-950 border border-slate-800 p-2.5 rounded-lg overflow-x-auto">
{p.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SYMMETRIC ENDPOINTS SELECTOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">[02] Endpoint Directory</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Select a Service to Inspect</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENDPOINT_ORDER.map((key) => {
            const meta = ENDPOINTS_META[key]
            return (
              <button
                key={key}
                onClick={() => handleSelectEndpoint(key)}
                className="group text-left bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/60 transition-all hover:bg-slate-900/90"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{meta.cardBadge}</span>
                  <span className="text-xs font-mono font-bold text-amber-300">{meta.price}</span>
                </div>
                <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{meta.name}</div>
                <code className="block mt-1 text-[10px] font-mono text-slate-500">{meta.path}</code>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">{meta.desc}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE WORKSPACE & LEDGER */}
      <section id="playground" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">[03] Execution Workspace</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {currentView === 'playground' ? 'Interactive Security Auditor' : 'Algorand TestNet Ledger'}
            </h2>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setCurrentView('playground')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                currentView === 'playground' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auditor
            </button>
            <button
              onClick={() => setCurrentView('ledger')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                currentView === 'ledger' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Chain Ledger
            </button>
          </div>
        </div>

        {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-800/80 pt-8 max-w-6xl mx-auto px-4 sm:px-6 text-xs font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>(C) 2026 Medusa Security Labs — Live on Algorand TestNet · x402 Protocol</div>
        <div className="flex gap-4">
          <a href="https://www.x402.org" target="_blank" rel="noreferrer" className="hover:text-slate-300">x402 Spec</a>
          <a href="https://lora.algokit.io/testnet" target="_blank" rel="noreferrer" className="hover:text-slate-300">Lora Explorer</a>
          <a href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer" className="hover:text-slate-300">GoPlausible</a>
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
