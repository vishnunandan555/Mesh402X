import React, { useState } from 'react'
import AsciiTerminal from './components/AsciiTerminal'
import AdsecPlayground from './components/AdsecPlayground'
import OnChainLedger from './components/OnChainLedger'
import {
  MedusaMark,
  IconArrowDown,
  IconArrowRight,
  IconExternal,
  IconFileDiff,
  IconScan,
  IconShieldCheck,
  IconVault,
  IconProps,
} from './components/icons'
import { ENDPOINTS_META, ENDPOINT_ORDER, setAdsecMode, EndpointMode } from './utils/adsecEndpoints'

const THREATS = [
  'SQL injection',
  'Command injection',
  'Hardcoded secrets',
  'XSS / eval sinks',
  'Typosquatted packages',
  'Insecure deserialization',
  'Unchecked ASA opt-in',
  'OSV.dev vulnerabilities',
]

const PIPELINE = [
  {
    step: '01',
    glyph: '>_',
    title: 'Send code',
    chip: 'text-base-200 border-base-600 bg-base-800',
    body: 'Submit source over HTTP. No accounts, API tokens, or subscriptions — the request pays for itself.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "py" }',
  },
  {
    step: '02',
    glyph: '[$]',
    title: 'Authorize micropayment',
    chip: 'text-amber-300 border-amber-500/30 bg-amber-500/[0.07]',
    body: 'The node challenges with HTTP 402. Sign a $0.001 TestNet USDC transfer — your wallet settles it in about half a second.',
    code: 'HTTP/1.1 402 PAYMENT REQUIRED\nX-PRICE: 0.001 USDC (ASA#10458941)',
  },
  {
    step: '03',
    glyph: '{=}',
    title: 'Receive patches & proof',
    chip: 'text-accent border-accent/30 bg-accent/10',
    body: 'Once payment settles on Algorand, get AST diagnostics, ready-to-apply git diffs, and an immutable SHA-256 attestation.',
    code: '200 OK -> findings[] fixes[] attestation',
  },
]

const STATS = [
  { value: '$0.001', label: 'per paid audit' },
  { value: '< 1.4s', label: 'settlement window' },
  { value: '42', label: 'deterministic detectors' },
  { value: '0', label: 'keys or logins' },
]

const ENDPOINT_ICONS: Record<EndpointMode, React.FC<IconProps>> = {
  scan: IconScan,
  remediate: IconFileDiff,
  attest: IconShieldCheck,
  audit: IconVault,
}

// Bento placement — Full Audit dominates, attestation runs as a wide strip
const ENDPOINT_SPAN: Record<EndpointMode, string> = {
  audit: 'lg:col-span-2 lg:row-span-2',
  scan: '',
  remediate: '',
  attest: 'lg:col-span-3',
}

export const AdsecHome: React.FC = () => {
  const [currentView, setCurrentView] = useState<'playground' | 'ledger'>('playground')

  const handleSelectEndpoint = (mode: EndpointMode) => {
    setAdsecMode(mode)
    setCurrentView('playground')
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-base-950 text-base-300">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-x-0 -top-64 h-[560px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 62% 55% at 52% 45%, rgba(52,185,138,0.13), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-shell mx-auto px-4 pt-20 pb-16 lg:pt-28 lg:pb-24 grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 mb-7">
              <span className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-md border border-accent/35 bg-accent/[0.08] text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                Algorand TestNet · live
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-base-700 bg-base-900 text-base-300">
                x402 protocol
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-base-800 text-base-400">pay per request</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl xl:text-[4rem] font-semibold leading-[1.04] tracking-[-0.03em] text-base-50">
              Autonomous code security.
              <br />
              <span className="text-accent">Settled on-chain, instantly.</span>
            </h1>

            <p className="mt-7 text-base-400 text-base sm:text-lg leading-relaxed max-w-[60ch]">
              Medusa lets AI agents and developers audit source code, generate ready-to-merge patches, and record cryptographic proof on
              Algorand — charged per request at $0.001 USDC over HTTP 402.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="#playground"
                onClick={() => setCurrentView('playground')}
                className="px-6 py-3.5 rounded-xl font-semibold bg-accent hover:bg-accent-bright text-base-ink shadow-glow transition-all duration-200 active:scale-[0.98] focus-ring flex items-center gap-2"
              >
                Run an audit
                <IconArrowDown size={15} />
              </a>
              <a
                href="#pipeline"
                className="px-5 py-3 rounded-xl font-medium text-sm border border-base-700 hover:border-base-500 hover:bg-white/[0.04] transition-all duration-200 active:scale-[0.98] focus-ring text-base-200"
              >
                How it works
              </a>
              <button
                onClick={() => {
                  setCurrentView('ledger')
                  document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group font-medium text-sm text-base-300 hover:text-accent transition-colors duration-200 focus-ring rounded-md flex items-center gap-1.5"
              >
                Settlement ledger
                <IconArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>

            <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 border-t border-base-800 pt-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl font-semibold text-base-100 tnum">{s.value}</dd>
                  <dd className="mt-1 text-[11px] text-base-500 font-mono lowercase tracking-wide">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5 animate-float-y">
            <AsciiTerminal title="Security node — live telemetry" phase="idle" />
            <p className="mt-4 text-center text-[11px] font-mono text-base-500 tracking-wide">
              Live service status · interactive environment below ↓
            </p>
          </div>
        </div>
      </section>
      {/* THREAT TICKER */}
      <section aria-label="Detected vulnerability categories" className="border-y border-base-800 bg-base-900/40 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {THREATS.map((t) => (
                <span key={`${copy}-${t}`} className="mx-5 text-xs font-mono text-base-400 flex items-center gap-5 lowercase">
                  {t}
                  <span className="text-accent/70">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE — connected vertical sequence */}
      <section id="pipeline" className="max-w-shell mx-auto px-4 pt-24 pb-28 scroll-mt-20">
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-accent/70" aria-hidden="true"></span>
            <p className="text-xs font-mono text-accent tracking-wide">Protocol sequence</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-base-50 leading-[1.1]">
            Three steps from request to verified fix
          </h2>
          <p className="mt-4 text-base-400 leading-relaxed">Every audit follows a deterministic lifecycle settled directly on Algorand.</p>
        </div>

        <ol className="relative ml-2 md:ml-4 border-l border-base-800 space-y-12">
          {PIPELINE.map((p) => (
            <li key={p.step} className="relative pl-8 md:pl-14">
              {/* spine node */}
              <span
                className="absolute -left-[9px] top-1 w-[18px] h-[18px] rounded-full bg-base-950 border-2 border-accent/60 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              </span>

              <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-start">
                <div className="md:col-span-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-md border ${p.chip}`}>{p.glyph}</span>
                    <span className="font-mono text-xs text-base-500 tnum">{p.step}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-base-100">{p.title}</h3>
                  <p className="mt-2.5 text-sm text-base-400 leading-relaxed max-w-[52ch]">{p.body}</p>
                </div>
                <pre className="md:col-span-5 text-[11px] font-mono text-accent/90 bg-base-ink border border-base-800 rounded-lg p-4 overflow-x-auto thin-scroll shadow-node">
                  {p.code}
                </pre>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ENDPOINTS — asymmetric bento */}
      <section id="endpoints" className="border-y border-base-800 bg-base-900/30 scroll-mt-20">
        <div className="max-w-shell mx-auto px-4 py-24">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent/70" aria-hidden="true"></span>
                <p className="text-xs font-mono text-accent tracking-wide">Available endpoints</p>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-base-50 leading-[1.1]">
                Pick a service to inspect
              </h2>
            </div>
            <p className="text-sm text-base-400 max-w-sm sm:text-right">
              Each endpoint is a dedicated x402 resource with fixed, transparent pricing.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 auto-rows-fr">
            {ENDPOINT_ORDER.map((key) => {
              const meta = ENDPOINTS_META[key]
              const Icon = ENDPOINT_ICONS[key]
              const isWide = key === 'attest'
              const isHero = key === 'audit'
              return (
                <button
                  key={key}
                  onClick={() => handleSelectEndpoint(key)}
                  className={`group text-left bg-base-900/80 border border-base-800 rounded-2xl p-6 transition-all duration-200 hover:border-accent/50 hover:bg-base-900 hover:shadow-pop active:scale-[0.99] focus-ring ${ENDPOINT_SPAN[key]} ${
                    isWide ? 'flex flex-col sm:flex-row sm:items-center gap-5' : 'flex flex-col'
                  }`}
                >
                  {isHero ? (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <span className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center">
                          <Icon size={19} />
                        </span>
                        <span className="font-display text-lg font-semibold text-accent tnum">
                          {meta.price.replace(' USDC', '')}
                          <span className="text-xs font-mono font-medium text-base-400 ml-1">USDC</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-accent/80 uppercase">{meta.cardBadge}</span>
                      <h3 className="mt-2 font-display text-2xl font-semibold text-base-50 group-hover:text-accent-bright transition-colors duration-200">
                        {meta.name}
                      </h3>
                      <code className="block mt-2 text-[11px] font-mono text-base-500">{meta.path}</code>
                      <p className="mt-3 text-sm text-base-400 leading-relaxed max-w-[48ch]">{meta.desc}</p>
                      <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-mono text-accent group-hover:text-accent-bright transition-colors duration-200">
                        Open in editor
                        <IconArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </>
                  ) : isWide ? (
                    <>
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-base-950 border border-base-700 text-base-300 flex items-center justify-center group-hover:border-accent/40 group-hover:text-accent transition-colors duration-200">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-mono tracking-widest text-base-500 uppercase">{meta.cardBadge}</span>
                          <code className="text-[11px] font-mono text-base-600 hidden md:inline">{meta.path}</code>
                        </div>
                        <h3 className="mt-1 font-semibold text-base-100 group-hover:text-accent-bright transition-colors duration-200">
                          {meta.name}
                        </h3>
                        <p className="mt-1 text-xs text-base-400 leading-relaxed line-clamp-2">{meta.desc}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono text-accent tnum mt-3 sm:mt-0">
                        {meta.price}
                        <IconArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <Icon size={17} className="text-base-400 group-hover:text-accent transition-colors duration-200" />
                        <span className="text-xs font-mono font-semibold text-accent tnum">{meta.price}</span>
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-base-500 uppercase">{meta.cardBadge}</span>
                      <h3 className="mt-1.5 font-semibold text-base-100 group-hover:text-accent-bright transition-colors duration-200">
                        {meta.name}
                      </h3>
                      <code className="block mt-1 text-[11px] font-mono text-base-600">{meta.path}</code>
                      <p className="mt-2.5 text-xs text-base-400 leading-relaxed line-clamp-3">{meta.desc}</p>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLAYGROUND & LEDGER */}
      <section id="playground" className="scroll-mt-20">
        <div className="max-w-shell mx-auto px-4 py-20">
          <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-accent/70" aria-hidden="true"></span>
                <p className="text-xs font-mono text-accent tracking-wide">
                  {currentView === 'playground' ? 'Interactive workspace' : 'On-chain ledger'}
                </p>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-base-50 leading-[1.1]">
                {currentView === 'playground' ? 'Run a security audit' : 'Algorand TestNet ledger'}
              </h2>
              <p className="mt-3 text-base-400 leading-relaxed">
                {currentView === 'playground'
                  ? 'Choose a code preset or write your own to run a live scan, negotiate an x402 payment challenge, and generate verified patches.'
                  : 'Immutable record of verified x402 payment settlements and SHA-256 code attestations on Algorand TestNet.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-base-900 border border-base-800 rounded-xl p-1 text-xs font-medium">
                <button
                  onClick={() => setCurrentView('playground')}
                  aria-pressed={currentView === 'playground'}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 focus-ring active:scale-[0.98] ${
                    currentView === 'playground' ? 'bg-accent text-base-ink shadow-glow' : 'text-base-400 hover:text-base-100'
                  }`}
                >
                  Auditor
                </button>
                <button
                  onClick={() => setCurrentView('ledger')}
                  aria-pressed={currentView === 'ledger'}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 focus-ring active:scale-[0.98] ${
                    currentView === 'ledger' ? 'bg-accent text-base-ink shadow-glow' : 'text-base-400 hover:text-base-100'
                  }`}
                >
                  Ledger
                </button>
              </div>

              <div className="hidden xl:block text-xs font-mono text-base-500 bg-base-900 border border-base-800 rounded-xl px-4 py-3 shrink-0 tnum">
                <div>
                  target :{' '}
                  <span className="text-base-300">{`${import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'}`}</span>
                </div>
                <div className="mt-1">
                  network : <span className="text-accent">algorand testnet</span>
                </div>
              </div>
            </div>
          </div>

          {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-800 bg-base-900/30">
        <div className="max-w-shell mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
          <div className="lg:col-span-2 max-w-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <MedusaMark size={26} />
              <span className="font-display font-semibold text-base-100">Medusa</span>
              <span className="text-xs font-mono text-base-500 tnum">v1.0.0 · TestNet</span>
            </div>
            <p className="text-base-500 text-xs leading-relaxed">
              Autonomous security node for machine-to-machine commerce, powered by the x402 open standard on Algorand.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-base-400">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> Accepting requests
            </div>
          </div>

          <nav aria-label="Site" className="space-y-2.5 text-xs">
            <div className="text-base-600 font-mono mb-3 lowercase tracking-wide">Site</div>
            <a
              href="#pipeline"
              className="block w-fit text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
            >
              How it works
            </a>
            <a
              href="#endpoints"
              className="block w-fit text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
            >
              Endpoints &amp; pricing
            </a>
            <a
              href="#playground"
              className="block w-fit text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
            >
              Live auditor
            </a>
          </nav>

          <div className="space-y-2.5 text-xs">
            <div className="text-base-600 font-mono mb-3 lowercase tracking-wide">Protocol</div>
            <a
              className="flex w-fit items-center gap-1.5 text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
              href="https://www.x402.org"
              target="_blank"
              rel="noreferrer"
            >
              x402 specification <IconExternal size={11} />
            </a>
            <a
              className="flex w-fit items-center gap-1.5 text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
              href="https://lora.algokit.io/testnet"
              target="_blank"
              rel="noreferrer"
            >
              Lora explorer <IconExternal size={11} />
            </a>
            <a
              className="flex w-fit items-center gap-1.5 text-base-400 hover:text-accent transition-colors duration-200 focus-ring rounded-sm"
              href="https://facilitator.goplausible.xyz"
              target="_blank"
              rel="noreferrer"
            >
              GoPlausible facilitator <IconExternal size={11} />
            </a>
            <div className="pt-1 text-base-600 font-mono">Settlement asset · TestNet USDC (ASA#10458941)</div>
          </div>
        </div>

        <div className="border-t border-base-800">
          <div className="max-w-shell mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-600 tnum">
            <div>© 2026 Medusa Security Labs — live on Algorand TestNet</div>
            <a
              href="https://github.com/vishnunandan555/Mesh402X"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-base-300 transition-colors duration-200 focus-ring rounded-sm"
            >
              Source &amp; licensing <IconExternal size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
