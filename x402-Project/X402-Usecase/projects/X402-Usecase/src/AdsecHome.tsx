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
    accentColor: '#e2e8f0',
    accentBg: 'rgba(255, 255, 255, 0.06)',
    accentBorder: 'rgba(255, 255, 255, 0.15)',
    body: 'Submit source code over HTTP. No accounts, API tokens, or upfront subscriptions required — the request pays for itself.',
    code: 'POST /adsec/audit\n{ "code": "...", "language": "py" }',
  },
  {
    step: '02',
    glyph: '[$]',
    title: 'Authorize Micropayment',
    accentColor: '#fbbf24',
    accentBg: 'rgba(245, 158, 11, 0.08)',
    accentBorder: 'rgba(245, 158, 11, 0.3)',
    body: 'The server challenges with HTTP 402 Payment Required. Sign a $0.001 TestNet USDC transfer in your Algorand wallet.',
    code: 'HTTP/1.1 402 PAYMENT REQUIRED\nX-PRICE: 0.001 USDC (ASA#10458941)',
  },
  {
    step: '03',
    glyph: '{=}',
    title: 'Receive Patches & Proof',
    accentColor: '#6ee7b7',
    accentBg: 'rgba(16, 185, 129, 0.08)',
    accentBorder: 'rgba(16, 185, 129, 0.3)',
    body: 'Once payment settles on Algorand, receive AST diagnostics, ready-to-apply git diffs, and an immutable SHA-256 attestation.',
    code: '200 OK -> findings[] fixes[] attestation',
  },
]

const STATS = [
  { value: '$0.001', label: 'Per Audit Call', color: '#f1f5f9' },
  { value: '< 2s', label: 'Turnaround Time', color: '#6ee7b7' },
  { value: '100%', label: 'On-Chain Verified', color: '#6ee7b7' },
  { value: '0', label: 'Subscriptions or Keys', color: '#f1f5f9' },
]

const ENDPOINT_ICONS: Record<EndpointMode, string> = {
  scan: '🔍',
  remediate: '🛠️',
  attest: '📜',
  audit: '🛡️',
}

export const AdsecHome: React.FC = () => {
  const [currentView, setCurrentView] = useState<'playground' | 'ledger'>('playground')

  const handleSelectEndpoint = (mode: EndpointMode) => {
    setAdsecMode(mode)
    setCurrentView('playground')
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden grid-bg">
        {/* Background orbs */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '200px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '-50px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6" style={{
          paddingTop: '80px',
          paddingBottom: '72px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '48px',
          alignItems: 'center',
        }}>
          <div className="lg:hidden" style={{ textAlign: 'center' }}>
            {/* Badges */}
            <div className="animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
              <span className="badge-emerald">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'radar-ping 2s cubic-bezier(0,0,0.2,1) infinite', position: 'relative', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                </span>
                ALGORAND TESTNET ACTIVE
              </span>
              <span className="badge-ghost">X402 PROTOCOL</span>
              <span className="badge-ghost" style={{ color: 'var(--text-muted)' }}>ZERO SUBSCRIPTIONS</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '48px', alignItems: 'center' }}>
            {/* Left Column */}
            <div>
              <div className="animate-fade-in hidden lg:flex" style={{ flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                <span className="badge-emerald">
                  <span className="status-dot status-dot-live" style={{ width: '6px', height: '6px' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                  </span>
                  ALGORAND TESTNET ACTIVE
                </span>
                <span className="badge-ghost">X402 PROTOCOL</span>
                <span className="badge-ghost" style={{ color: 'var(--text-muted)' }}>ZERO SUBSCRIPTIONS</span>
              </div>

              <h1 className="animate-fade-in-delay-1" style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                margin: 0,
              }}>
                Autonomous code security.
                <br />
                <span className="text-gradient">Instant on-chain settlement.</span>
              </h1>

              <p className="animate-fade-in-delay-2" style={{
                marginTop: '24px',
                color: 'var(--text-secondary)',
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                lineHeight: 1.7,
                maxWidth: '560px',
              }}>
                Medusa lets AI agents and developers audit source code, generate ready-to-merge patches, and record cryptographic proof on Algorand — charged per request at $0.001 USDC via HTTP 402.
              </p>

              {/* CTAs */}
              <div className="animate-fade-in-delay-3" style={{ marginTop: '36px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <a
                  href="#playground"
                  onClick={() => setCurrentView('playground')}
                  className="btn-primary"
                >
                  Run an audit ↓
                </a>
                <button
                  onClick={() => {
                    setCurrentView('ledger')
                    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-secondary"
                  style={currentView === 'ledger' ? {
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    color: '#6ee7b7',
                  } : {}}
                >
                  📜 Audit Ledger
                </button>
                <a href="#pipeline" className="btn-secondary">
                  How it works
                </a>
              </div>

              {/* Stats */}
              <dl className="animate-fade-in-delay-3" style={{
                marginTop: '48px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
              }}>
                {STATS.map((s) => (
                  <div key={s.label} style={{
                    borderLeft: '2px solid rgba(16, 185, 129, 0.3)',
                    paddingLeft: '14px',
                  }}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</dd>
                    <dd style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '4px',
                    }}>{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right Column — Terminal */}
            <div className="animate-float-y">
              <AsciiTerminal title="Security Node — Live Telemetry" phase="idle" />
              <p style={{
                marginTop: '14px',
                textAlign: 'center',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}>
                Live service status · interactive test environment below ↓
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THREAT TICKER ═══ */}
      <section aria-label="Detected vulnerability categories" style={{
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-deep)',
        padding: '14px 0',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Edge fade left */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, var(--bg-deep), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        {/* Edge fade right */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to left, var(--bg-deep), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {THREATS.map((t) => (
                <span key={`${copy}-${t}`} style={{
                  margin: '0 28px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                }}>
                  {t}
                  <span style={{ color: '#10b981', opacity: 0.5 }}>//</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section id="pipeline" className="scroll-mt-20" style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 16px' }}>
        <div style={{ marginBottom: '52px', textAlign: 'center' }}>
          <p className="animate-fade-in" style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#10b981',
            marginBottom: '12px',
          }}>Protocol Sequence</p>
          <h2 className="animate-fade-in-delay-1" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Three steps from request to verified fix
          </h2>
          <p className="animate-fade-in-delay-2" style={{ marginTop: '12px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0' }}>
            Every audit follows a deterministic verification lifecycle settled directly on Algorand.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', position: 'relative' }}>
          {/* Connecting line */}
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: '50%',
            left: '16%',
            right: '16%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2), transparent)',
            zIndex: 0,
          }} />

          {PIPELINE.map((p, i) => (
            <div
              key={p.step}
              className="card card-interactive animate-fade-in"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '28px',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: p.accentBg,
                  color: p.accentColor,
                  border: `1px solid ${p.accentBorder}`,
                }}>{p.glyph}</span>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.04)', userSelect: 'none', lineHeight: 1 }}>{p.step}</span>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>{p.body}</p>
              <pre style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#6ee7b7',
                background: '#080c14',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                margin: 0,
                overflowX: 'auto',
              }}>
{p.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ENDPOINTS ═══ */}
      <section id="endpoints" className="scroll-mt-20" style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-surface) 100%)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 16px' }}>
          <div style={{ marginBottom: '52px', textAlign: 'center' }}>
            <p style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#06b6d4',
              marginBottom: '12px',
            }}>Available Endpoints</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Pick a service to inspect
            </h2>
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '12px auto 0' }}>
              Each endpoint is a dedicated x402 resource with fixed, transparent pricing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {ENDPOINT_ORDER.map((key, i) => {
              const meta = ENDPOINTS_META[key]
              return (
                <button
                  key={key}
                  onClick={() => handleSelectEndpoint(key)}
                  className="card card-interactive"
                  style={{
                    padding: '24px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px' }}>{ENDPOINT_ICONS[key]}</span>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: '#fbbf24',
                    }}>{meta.price}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem' }}>{meta.name}</span>
                  </div>
                  <code style={{
                    display: 'block',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    marginBottom: '8px',
                  }}>{meta.path}</code>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>{meta.desc}</p>
                  <span className="badge-emerald" style={{ fontSize: '10px' }}>
                    {meta.cardBadge} →
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ PLAYGROUND & LEDGER ═══ */}
      <section id="playground" className="scroll-mt-20" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 16px' }}>
          <div style={{
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3em',
                  color: '#10b981',
                  marginBottom: '12px',
                }}>
                  {currentView === 'playground' ? 'Interactive Workspace' : 'On-Chain Ledger'}
                </p>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {currentView === 'playground' ? 'Run a Security Audit' : 'Algorand TestNet Ledger'}
                </h2>
                <p style={{ marginTop: '12px', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                  {currentView === 'playground'
                    ? 'Choose a code preset or write your own to run a live scan, negotiate an x402 payment challenge, and generate verified patches.'
                    : 'Immutable record of verified x402 payment settlements and SHA-256 code attestations on Algorand TestNet.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '4px',
                }}>
                  <button
                    onClick={() => setCurrentView('playground')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-default)',
                      background: currentView === 'playground' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                      color: currentView === 'playground' ? '#000' : 'var(--text-muted)',
                      boxShadow: currentView === 'playground' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  >
                    Interactive Auditor
                  </button>
                  <button
                    onClick={() => setCurrentView('ledger')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-default)',
                      background: currentView === 'ledger' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                      color: currentView === 'ledger' ? '#000' : 'var(--text-muted)',
                      boxShadow: currentView === 'ledger' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  >
                    📜 On-Chain Ledger
                  </button>
                </div>

                {/* Server info */}
                <div className="hidden md:block" style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-dim)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 16px',
                  flexShrink: 0,
                }}>
                  <div>target : <span style={{ color: 'var(--text-secondary)' }}>{`${import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'}`}</span></div>
                  <div style={{ marginTop: '4px' }}>network : <span style={{ color: '#10b981' }}>algorand testnet</span></div>
                </div>
              </div>
            </div>
          </div>

          {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep)' }}>
        {/* Gradient separator */}
        <div className="animate-gradient" style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.2), transparent)',
          backgroundSize: '200% 200%',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '32px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}>🐍</div>
              <span style={{ fontWeight: 900, letterSpacing: '0.06em', color: '#fff' }}>
                MEDUSA<span style={{ color: '#10b981' }}>.</span>
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>v1.0.0 · TestNet</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.7, maxWidth: '280px' }}>
              Autonomous security node for machine-to-machine commerce. Powered by the x402 open standard on Algorand.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-dim)', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '8px' }}>Protocol & Explorer</div>
            {[
              { label: 'x402 Specification', url: 'https://www.x402.org' },
              { label: 'Algorand Lora Explorer', url: 'https://lora.algokit.io/testnet' },
              { label: 'GoPlausible Facilitator', url: 'https://facilitator.goplausible.xyz' },
            ].map(link => (
              <a
                key={link.label}
                className="text-sm"
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {link.label} ↗
              </a>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-dim)', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '8px' }}>Service Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <span className="status-dot status-dot-live" style={{ width: '6px', height: '6px' }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
              </span>
              Accepting requests
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Settlement: GoPlausible Facilitator</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Asset: TestNet USDC (ASA#10458941)</div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 16px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
        }}>
          © 2026 Medusa Security Labs — Live on Algorand TestNet · x402 Protocol
        </div>
      </footer>
    </div>
  )
}

export default AdsecHome
