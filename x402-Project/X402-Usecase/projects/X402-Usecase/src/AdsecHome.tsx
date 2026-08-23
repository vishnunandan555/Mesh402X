import React from 'react'
import AsciiTerminal from './components/AsciiTerminal'
import AdsecPlayground from './components/AdsecPlayground'
import { ENDPOINTS_META, ENDPOINT_ORDER, setAdsecMode, EndpointMode } from './utils/adsecEndpoints'

const THREATS = [
  'SQL injection',
  'command injection',
  'hardcoded secrets',
  'XSS / eval sinks',
  'typosquatted deps',
  'insecure deserialization',
  'unchecked ASA opt-in',
  'OSV.dev CVE sync',
]

const PIPELINE = [
  {
    step: '01',
    glyph: '>_',
    title: 'Call the node',
    accent: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
    body: 'Your agent POSTs source code to /adsec/*. No API keys, no signups, no dashboards — the HTTP request is the customer.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "py" }',
  },
  {
    step: '02',
    glyph: '[$]',
    title: 'Get challenged, pay in one tap',
    accent: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
    body: 'The node answers HTTP 402 Payment Required with a micropayment invoice. Your wallet signs a $0.01–$0.05 TestNet USDC transfer (ASA 10458941).',
    code: 'HTTP/1.1 402 PAYMENT REQUIRED\nX-PRICE: 0.05 USDC',
  },
  {
    step: '03',
    glyph: '{=}',
    title: 'Settled on-chain, results stream back',
    accent: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    body: 'The GoPlausible facilitator verifies settlement on Algorand, then the node returns findings, git-ready patches and a SHA-256 attestation.',
    code: '200 OK -> findings[] fixes[] attestation',
  },
]

const STATS = [
  { value: '4', label: 'paid endpoints' },
  { value: '$0.01', label: 'floor price / call' },
  { value: '<2s', label: 'median audit time' },
  { value: '100%', label: 'on-chain attestations' },
]

export const AdsecHome: React.FC = () => {
  const useEndpoint = (mode: EndpointMode) => {
    setAdsecMode(mode)
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
                NODE ONLINE — TESTNET
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                x402 PROTOCOL
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
                USDC MICROPAYMENTS
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
              AI agents shouldn't ship
              <br />
              vulnerabilities.
              <br />
              <span className="text-gradient">So they pay us to catch them.</span>
            </h1>

            <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              AdSec is a live pay-per-call security node on Algorand. Every button on this page fires a real
              HTTP&nbsp;402 handshake, settles real TestNet USDC, and streams back scans, git-ready patches and an
              on-chain proof of audit.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#playground"
                className="px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                Run a live audit ↓
              </a>
              <a
                href="#pipeline"
                className="px-6 py-3.5 rounded-xl font-bold border border-slate-700 hover:border-slate-500 hover:bg-slate-900 transition-all"
              >
                How the pipeline works
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
            <AsciiTerminal title="adsec-node — perimeter feed" phase="idle" />
            <p className="mt-3 text-center text-[11px] font-mono text-slate-600 uppercase tracking-widest">
              simulated perimeter · the real pipeline runs below ↓
            </p>
          </div>
        </div>
      </section>

      {/* THREAT TICKER */}
      <section aria-label="detected threat classes" className="border-y border-slate-800/80 bg-slate-950 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {THREATS.map((t) => (
                <span key={`${copy}-${t}`} className="mx-6 text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-6">
                  {t}
                  <span className="text-red-500">//</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 py-20 scroll-mt-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400 mb-3">the working behaviour</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">One handshake. Three moves.</h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            This isn't a mockup — the playground below performs exactly this sequence against the live node.
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
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">green cards</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Pick your endpoint</h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto">Each card is a separately payable x402 resource with its own fixed price.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENDPOINT_ORDER.map((key) => {
              const meta = ENDPOINTS_META[key]
              return (
                <button
                  key={key}
                  onClick={() => useEndpoint(key)}
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
                    load in playground →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* PLAYGROUND */}
      <section id="playground" className="border-t border-slate-800/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-3">live playground</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Fire a real audit</h2>
              <p className="mt-3 text-slate-400 max-w-xl">
                Load a vulnerable preset or paste your own code, then watch the terminal walk through attack, challenge,
                signature, settlement and patching — frame by frame.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 shrink-0">
              <div>target : <span className="text-slate-300">{`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021'}`}</span></div>
              <div className="mt-1">network : <span className="text-emerald-400">algorand testnet</span></div>
            </div>
          </div>

          <AdsecPlayground />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-black text-white tracking-wide">ADSEC<span className="text-indigo-400">.</span></div>
            <p className="mt-2 text-slate-500 text-xs leading-relaxed max-w-xs">
              Autonomous pre-flight security node for machine-to-machine commerce. Built on the x402 protocol and Algorand.
            </p>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-slate-600 mb-3">protocol</div>
            <a className="block text-slate-400 hover:text-indigo-300" href="https://www.x402.org" target="_blank" rel="noreferrer">x402 specification ↗</a>
            <a className="block text-slate-400 hover:text-indigo-300" href="https://lora.algokit.io/testnet" target="_blank" rel="noreferrer">Algorand explorer ↗</a>
            <a className="block text-slate-400 hover:text-indigo-300" href="https://osv.dev" target="_blank" rel="noreferrer">OSV.dev vulnerability feed ↗</a>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="uppercase tracking-widest text-slate-600 mb-3">node status</div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> accepting paid calls
            </div>
            <div className="text-slate-600">settlement: goplausible facilitator</div>
            <div className="text-slate-600">asset: USDC ASA#10458941</div>
          </div>
        </div>
        <div className="border-t border-slate-900 py-4 text-center text-[11px] font-mono text-slate-600">
          © 2026 AdSec Labs — demo build on TestNet · nothing here is financial advice
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
