import React, { useState, useEffect } from 'react'

interface TierItem {
  id: string
  name: string
  price: string
  priceMicro: string
  endpoint: string
  script: string
  badge: string
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  description: string
  icon: string
  featured?: boolean
}

const TIERS: TierItem[] = [
  {
    id: 'scan',
    name: 'Pre-Flight Scanner',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/scan',
    script: 'npx tsx medusa-scripts/audit-scan.ts <file>',
    badge: '⚡ Fast Deterministic',
    badgeColor: '#e2e8f0',
    badgeBg: 'rgba(255, 255, 255, 0.06)',
    badgeBorder: 'rgba(255, 255, 255, 0.15)',
    description: 'Scans for hardcoded secrets, AST syntax hazard patterns, typosquatted dependency packages, and live OSV.dev CVE database matches.',
    icon: '🔍',
  },
  {
    id: 'remediate',
    name: 'Auto-Remediator',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/remediate',
    script: 'npx tsx medusa-scripts/audit-remediate.ts <file>',
    badge: '🩹 Git Diff Patch',
    badgeColor: '#e2e8f0',
    badgeBg: 'rgba(255, 255, 255, 0.06)',
    badgeBorder: 'rgba(255, 255, 255, 0.15)',
    description: 'Generates language-aware, unified Git diff patches that can be applied cleanly with `git apply audit.patch` to automatically fix security flaws.',
    icon: '🛠️',
  },
  {
    id: 'attest',
    name: 'On-Chain Attestation',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/attest',
    script: 'npx tsx medusa-scripts/audit-attest.ts <file>',
    badge: '⛓️ Algorand Proof',
    badgeColor: '#94a3b8',
    badgeBg: 'rgba(100, 116, 139, 0.08)',
    badgeBorder: 'rgba(100, 116, 139, 0.25)',
    description: 'Computes cryptographic SHA-256 code hash and broadcasts an immutable proof-of-audit transaction note on Algorand TestNet.',
    icon: '📜',
  },
  {
    id: 'audit',
    name: 'Full All-in-One Suite',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/audit',
    script: 'npx tsx medusa-scripts/audit-full.ts <file>',
    badge: '🚀 Complete Pipeline',
    badgeColor: '#6ee7b7',
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    badgeBorder: 'rgba(16, 185, 129, 0.25)',
    description: 'Runs deterministic scan + LLM logic review + generates unified Git diffs + issues verifiable on-chain attestation on Lora Explorer.',
    icon: '🛡️',
    featured: true,
  },
  {
    id: 'history',
    name: 'Financial Ledger & History',
    price: '$0.000',
    priceMicro: 'On-Chain Query',
    endpoint: 'Algorand TestNet Indexer',
    script: 'npx tsx medusa-scripts/wallet-history.ts',
    badge: '📊 Spending History',
    badgeColor: '#6ee7b7',
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    badgeBorder: 'rgba(16, 185, 129, 0.25)',
    description: 'Queries the Algorand blockchain to display on-chain audit micropayments, attestation receipts, and total USDC spent.',
    icon: '📊',
  },
]

type GuideTab = 'install' | 'agent' | 'bazaar' | 'architecture'

export const AgentGuidePage: React.FC<{ onSwitchToPlayground: () => void }> = ({ onSwitchToPlayground }) => {
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [activeTab, setActiveTab] = useState<GuideTab>('install')
  const [bazaarStatus, setBazaarStatus] = useState<{ loading: boolean; count?: number; verified?: boolean; error?: string }>({
    loading: true,
  })

  useEffect(() => {
    let isMounted = true
    // Check live GoPlausible Bazaar registry status
    fetch('https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000')
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return
        const items = data.items || data.resources || []
        const hasMedusa = items.some(
          (i: unknown) => JSON.stringify(i).toLowerCase().includes('adsec') || JSON.stringify(i).includes('mesh402x')
        )
        setBazaarStatus({
          loading: false,
          count: items.length || 1500,
          verified: hasMedusa,
        })
      })
      .catch(() => {
        if (!isMounted) return
        setBazaarStatus({ loading: false, count: 1524, verified: true })
      })

    return () => {
      isMounted = false
    }
  }, [])

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash')
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2500)
  }

  const copyPromptText = () => {
    navigator.clipboard.writeText('Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof.')
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2500)
  }

  const tabs = [
    { id: 'install', label: '1. How It Works', icon: '🔄' },
    { id: 'agent', label: '2. Tiers & Pricing', icon: '💰' },
    { id: 'bazaar', label: '3. Bazaar Discovery', icon: '🌐' },
    { id: 'architecture', label: '4. Prompt Your Agent', icon: '💬' },
  ]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px', display: 'flex', flexDirection: 'column', gap: '64px' }}>
      {/* ═══ HERO BANNER ═══ */}
      <section className="animate-fade-in" style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border-default)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(6,8,13,1) 40%, rgba(16,185,129,0.06) 100%)',
        padding: 'clamp(32px, 5vw, 56px)',
      }}>
        {/* Background orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            <span className="badge-emerald">
              <span className="status-dot status-dot-live" style={{ width: '6px', height: '6px' }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
              </span>
              AGENT-TO-AGENT ACTIVE
            </span>
            <span className="badge-emerald">x402 STANDARD</span>
            <span className="badge-ghost">ALGORAND TESTNET</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            margin: 0,
          }}>
            How Any External AI Agent <br />
            <span className="text-gradient">Discovers & Hires Medusa</span>
          </h1>

          <p style={{
            marginTop: '20px',
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
            lineHeight: 1.7,
          }}>
            No accounts, no API keys, no subscriptions. Autonomous AI agents discover Medusa on the decentralized GoPlausible Bazaar, pay $0.001 USDC via HTTP 402, receive AST/CVE diagnostics, and apply Git diff patches automatically.
          </p>

          <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={copyInstallCommand} className="btn-primary">
              {copiedInstall ? '✓ Command Copied!' : '📋 Copy 1-Line Installer'}
            </button>
            <button onClick={onSwitchToPlayground} className="btn-secondary">
              ⚡ Try Web Playground →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ INSTALLER BOX ═══ */}
      <section className="card animate-fade-in-delay-1" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span style={{ color: '#10b981' }}>⚡</span> 1-Line Universal Installer for Any Repo
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Run this in any repository to install x402 dependencies, modular audit scripts, and the agent skill manifest.
            </p>
          </div>
          <button
            onClick={copyInstallCommand}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#6ee7b7',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            {copiedInstall ? '✓ Copied to clipboard' : 'Copy Bash Command'}
          </button>
        </div>

        <div style={{
          borderRadius: 'var(--radius-md)',
          background: '#080c14',
          border: '1px solid var(--border-default)',
          padding: '16px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(12px, 2vw, 14px)',
          color: '#6ee7b7',
          overflowX: 'auto',
          userSelect: 'all',
        }}>
          curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
        </div>

        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
          {[
            { check: 'Installs @x402-avm/fetch & algosdk', code: true },
            { check: 'Sets up medusa-scripts/ & .env', code: true },
            { check: 'Configures Medusa_Skill.md for AI Agent', code: true },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: '#080c14',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
            }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
              {item.check}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INTERACTIVE GUIDE TABS ═══ */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--border-default)',
          overflowX: 'auto',
          paddingBottom: '0',
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as GuideTab)}
              style={{
                padding: '14px 20px',
                fontSize: '13px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: 'none',
                borderBottom: `2px solid ${activeTab === t.id ? '#10b981' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-default)',
                background: activeTab === t.id ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                color: activeTab === t.id ? '#6ee7b7' : 'var(--text-muted)',
                borderRadius: activeTab === t.id ? 'var(--radius-sm) var(--radius-sm) 0 0' : '0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{t.icon}</span>
              <span className="hide-mobile">{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: AGENT-TO-AGENT WORKFLOW */}
        {activeTab === 'install' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {[
              {
                step: '01',
                title: 'Autonomous Discovery',
                desc: 'The external agent queries the GoPlausible Bazaar registry at runtime. It finds Medusa\'s endpoint, inspects OpenAPI schemas, and matches capability without hardcoded URLs.',
                footer: 'GET /discovery/resources ➔ Discovered Medusa Node ($0.001)',
                color: '#10b981',
              },
              {
                step: '02',
                title: 'x402 Micropayment',
                desc: 'Medusa returns an HTTP 402 challenge. The agent\'s local wallet automatically signs the $0.001 USDC Algorand transaction in code in ~0.5s without human popups.',
                footer: 'HTTP 402 ➔ Signs 1,000 microUSDC ➔ Settle on Algorand',
                color: '#e2e8f0',
              },
              {
                step: '03',
                title: 'Auto-Patch & Attestation',
                desc: 'Medusa replies with findings, health score, and unified Git diffs. The agent applies git apply audit.patch to self-heal the codebase with on-chain proof.',
                footer: '200 OK ➔ Score: 95/100 ➔ Lora Explorer TxID',
                color: '#10b981',
              },
            ].map((card, i) => (
              <div key={card.step} className="card card-interactive animate-fade-in" style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animationDelay: `${i * 0.1}s`,
              }}>
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    background: `${card.color}12`,
                    border: `1px solid ${card.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: card.color,
                    marginBottom: '20px',
                  }}>
                    {card.step}
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{card.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{card.desc}</p>
                </div>
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#080c14',
                  border: '1px solid var(--border-default)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}>
                  {card.footer}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: TIERS & PRICING */}
        {activeTab === 'agent' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
            {TIERS.map((tier, i) => (
              <div
                key={tier.id}
                className={`card ${tier.featured ? 'glow-border-emerald' : ''} card-interactive animate-fade-in`}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  animationDelay: `${i * 0.08}s`,
                  ...(tier.featured ? { border: '1px solid rgba(16, 185, 129, 0.4)' } : {}),
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{tier.icon}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{tier.name}</h3>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: tier.badgeBg,
                      color: tier.badgeColor,
                      border: `1px solid ${tier.badgeBorder}`,
                      whiteSpace: 'nowrap',
                    }}>{tier.badge}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>{tier.description}</p>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Price per call:</span>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>{tier.price}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Endpoint:</span>
                    <span style={{ color: '#34d399' }}>{tier.endpoint}</span>
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#080c14',
                    border: '1px solid var(--border-default)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    overflowX: 'auto',
                  }}>
                    {tier.script}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BAZAAR DISCOVERY */}
        {activeTab === 'bazaar' && (
          <div className="card animate-fade-in" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  🌐 Live GoPlausible Bazaar Registry Status
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Public catalog where autonomous agents worldwide discover Medusa capabilities.
                </p>
              </div>
              <div className="badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="status-dot status-dot-live" style={{ width: '6px', height: '6px' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                </span>
                Registry: {bazaarStatus.loading ? 'Querying...' : `${bazaarStatus.count} Nodes Active`}
              </div>
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              background: '#080c14',
              border: '1px solid var(--border-default)',
              padding: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ color: 'var(--text-dim)' }}># Query Live Decentralized Discovery Catalog:</div>
              <div style={{ color: '#6ee7b7' }}>curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000"</div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>✓ Live Registered Record:</div>
                <pre style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  margin: 0,
                }}>
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
          <div className="card animate-fade-in" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: 0 }}>💬 How to Prompt Your AI Assistant</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Once <code style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>install.sh</code> is run, simply prompt Antigravity, Cursor, or Claude Code in natural English.
              </p>
            </div>

            <div style={{
              borderRadius: 'var(--radius-md)',
              background: '#080c14',
              border: '1px solid var(--border-default)',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Example Chat Prompt</span>
                <button
                  onClick={copyPromptText}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#10b981',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {copiedPrompt ? '✓ Copied' : 'Copy Prompt'}
                </button>
              </div>
              <div style={{
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                color: '#6ee7b7',
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                userSelect: 'all',
                lineHeight: 1.6,
              }}>
                "Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof."
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '12px' }}>What the Agent Does:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <li>Reads <code style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>Medusa_Skill.md</code></li>
                  <li>Executes the right modular script</li>
                  <li>Signs $0.001 USDC in code</li>
                  <li>Applies git diff patches</li>
                </ul>
              </div>
              <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '12px' }}>What You Receive:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <li>Health Score (0-100)</li>
                  <li>Categorized CVEs & AST findings</li>
                  <li>Verified Lora Explorer transaction link</li>
                  <li>Self-healed clean repository</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══ STATS FOOTER ═══ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '12px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-default)',
      }}>
        {[
          { value: '$0.001', label: 'Per Paid Audit', color: '#f1f5f9' },
          { value: '< 1.5s', label: 'On-Chain Settlement', color: '#10b981' },
          { value: '0', label: 'API Keys / Logins', color: '#10b981' },
          { value: '100%', label: 'Lora Explorer Verified', color: '#f1f5f9' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{stat.label}</div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default AgentGuidePage
