import React, { useEffect, useMemo, useState } from 'react'

export type TerminalPhase =
  | 'idle'
  | 'recon'
  | 'challenge'
  | 'signing'
  | 'settling'
  | 'patching'
  | 'success'
  | 'error'

const W = 18

function attackFrames(): string[] {
  const labels = ['AST-Tree', 'Secrets ', 'Pkg-CVE ', 'DataFlow']
  const headers = [
    '[*] Scanning AST node hierarchy...',
    '[*] Checking secret pattern entropy...',
    '[*] Cross-referencing OSV.dev advisory database...',
  ]
  const frames: string[] = []
  for (let p = 0; p <= W; p++) {
    const header = headers[Math.min(headers.length - 1, Math.floor((p / (W + 1)) * headers.length))]
    const rows = labels.map((l) => `[${l}] ${'.'.repeat(p)}=>${'>'.repeat(W - p)}`)
    frames.push([header, '', ...rows, ''].join('\n'))
  }
  frames.push(
    ['', '[✓] Static analysis & rule evaluation complete', '', ...labels.map((l) => `[${l}] ${'#'.repeat(W)}||`), ''].join('\n')
  )
  return frames
}

function settleFrames(): string[] {
  const total = 15
  const frames: string[] = []
  for (let i = 0; i <= total; i++) {
    const bar = `${'#'.repeat(i)}${i === total ? '' : '*'}${'.'.repeat(Math.max(0, total - i - 1))}`
    const status = i === total ? 'CONFIRMED ON-CHAIN' : `Settling.. ${(i / total * 100).toFixed(0)}%`
    frames.push(
      [
        'Client Wallet  ──>  Facilitator  ──>  Algorand TestNet',
        '',
        'Transaction Round  : #48,201,334',
        `[${bar}]  ${status}`,
        '',
        'Settlement Protocol: x402 / USDC (ASA#10458941)',
      ].join('\n')
    )
  }
  return frames
}

const IDLE_FRAMES = [
  [
    'Service : Medusa Security Node (Algorand TestNet)',
    'Protocol: x402 Micropayment Standard',
    '',
    'Rulesets: 42 deterministic detectors active',
    'CVE Sync: OSV.dev vulnerability index synchronized',
    '',
    'Status  : Standing by for incoming audit request...',
  ].join('\n'),
  [
    'Service : Medusa Security Node (Algorand TestNet)',
    'Protocol: x402 Micropayment Standard',
    '',
    'Rulesets: 42 deterministic detectors active',
    'CVE Sync: OSV.dev vulnerability index synchronized',
    '',
    'Status  : Ready to receive code payload.',
  ].join('\n'),
]

const RECON_FRAMES = attackFrames()

const CHALLENGE_FRAMES = [
  [
    '> POST /adsec/audit HTTP/1.1',
    '> Content-Type: application/json',
    '',
    '< HTTP/1.1 402 PAYMENT REQUIRED',
    '< Price : $0.001 USDC (ASA#10458941)',
    '< Via   : GoPlausible Facilitator',
    '',
    '+──────────────────────────────────+',
    '| Waiting for wallet signature...  |',
    '+──────────────────────────────────+',
  ].join('\n'),
  [
    '> POST /adsec/audit HTTP/1.1',
    '> Content-Type: application/json',
    '',
    '< HTTP/1.1 402 PAYMENT REQUIRED',
    '< Price : $0.001 USDC (ASA#10458941)',
    '< Via   : GoPlausible Facilitator',
    '',
    '+──────────────────────────────────+',
    '| Waiting for wallet signature _   |',
    '+──────────────────────────────────+',
  ].join('\n'),
]

const SIGNING_FRAMES = [
  [
    '┌─────────────────────────────┐',
    '│ Algorand Wallet Connection  │',
    '│ Network : Algorand TestNet  │',
    '│ Asset   : 0.001 TestNet USDC│',
    '│ Confirm transfer? ...... Y< │',
    '└─────────────────────────────┘',
    '              │',
    '              ▼',
    'Signature ed25519: 7xKq...9fQ=',
  ].join('\n'),
  [
    '┌─────────────────────────────┐',
    '│ Algorand Wallet Connection  │',
    '│ Network : Algorand TestNet  │',
    '│ Asset   : 0.001 TestNet USDC│',
    '│ Confirm transfer? ...... Y< │',
    '└─────────────────────────────┘',
    '              │',
    '              ▼',
    'Signature ed25519: mR2v...kQ8z',
  ].join('\n'),
]

const SETTLE_FRAMES = settleFrames()

const PATCH_FRAMES = [
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- sql = f"SELECT * FROM users WHERE id = {user_id}"',
    '+ sql = "SELECT * FROM users WHERE id = %s", (user_id,)',
    '',
    'Generating patch 1 of 3 ... ok',
  ].join('\n'),
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- OPENAI_API_KEY = "sk-proj-abc..."',
    '+ OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")',
    '',
    'Generating patch 2 of 3 ... ok',
  ].join('\n'),
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- import reqeusts',
    '+ import requests',
    '',
    'Validating git diff syntax ... PASS',
  ].join('\n'),
]

const SUCCESS_FRAME = [
  '  ┌──────────────────────────────────┐',
  '  │        AUDIT COMPLETE            │',
  '  │                                  │',
  '  │  ✓ Diagnostics & score generated │',
  '  │  ✓ Git patches ready to apply    │',
  '  │  ✓ Attestation written on-chain  │',
  '  │  ✓ HTTP 200 payload returned     │',
  '  └──────────────────────────────────┘',
].join('\n')

const ERROR_FRAME = [
  '── Audit Process Interrupted ──',
  '',
  'Possible causes:',
  ' • Wallet signature rejected or timed out',
  ' • Insufficient TestNet USDC or ALGO balance',
  ' • Network connectivity issue with facilitator',
  '',
  'Check your wallet and try again.',
].join('\n')

interface PhaseTheme {
  label: string
  step: string
  textColor: string
  glowColor: string
  chipBg: string
  chipText: string
  chipBorder: string
}

const THEMES: Record<TerminalPhase, PhaseTheme> = {
  idle: {
    label: 'STANDBY',
    step: 'Ready for request',
    textColor: '#94a3b8',
    glowColor: 'transparent',
    chipBg: 'rgba(100, 116, 139, 0.1)',
    chipText: '#94a3b8',
    chipBorder: 'rgba(100, 116, 139, 0.3)',
  },
  recon: {
    label: 'STATIC ANALYSIS',
    step: 'Step 1/5 · Analyzing code structure',
    textColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.08)',
    chipBg: 'rgba(239, 68, 68, 0.1)',
    chipText: '#fca5a5',
    chipBorder: 'rgba(239, 68, 68, 0.3)',
  },
  challenge: {
    label: 'HTTP 402 CHALLENGE',
    step: 'Step 2/5 · Micropayment invoice generated',
    textColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.08)',
    chipBg: 'rgba(245, 158, 11, 0.1)',
    chipText: '#fcd34d',
    chipBorder: 'rgba(245, 158, 11, 0.3)',
  },
  signing: {
    label: 'WALLET SIGNATURE',
    step: 'Step 3/5 · Awaiting user signature',
    textColor: '#e2e8f0',
    glowColor: 'rgba(255, 255, 255, 0.04)',
    chipBg: 'rgba(255, 255, 255, 0.08)',
    chipText: '#f1f5f9',
    chipBorder: 'rgba(255, 255, 255, 0.2)',
  },
  settling: {
    label: 'ON-CHAIN SETTLEMENT',
    step: 'Step 4/5 · Confirming on Algorand TestNet',
    textColor: '#6ee7b7',
    glowColor: 'rgba(16, 185, 129, 0.08)',
    chipBg: 'rgba(16, 185, 129, 0.1)',
    chipText: '#6ee7b7',
    chipBorder: 'rgba(16, 185, 129, 0.3)',
  },
  patching: {
    label: 'PATCH GENERATION',
    step: 'Step 5/5 · Creating unified diffs',
    textColor: '#6ee7b7',
    glowColor: 'rgba(16, 185, 129, 0.08)',
    chipBg: 'rgba(16, 185, 129, 0.1)',
    chipText: '#6ee7b7',
    chipBorder: 'rgba(16, 185, 129, 0.3)',
  },
  success: {
    label: 'VERIFIED & DELIVERED',
    step: 'Complete · Audit report delivered',
    textColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.1)',
    chipBg: 'rgba(16, 185, 129, 0.15)',
    chipText: '#6ee7b7',
    chipBorder: 'rgba(16, 185, 129, 0.4)',
  },
  error: {
    label: 'INTERRUPTED',
    step: 'Request halted',
    textColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.08)',
    chipBg: 'rgba(239, 68, 68, 0.1)',
    chipText: '#fca5a5',
    chipBorder: 'rgba(239, 68, 68, 0.3)',
  },
}

function framesFor(phase: TerminalPhase): string[] {
  switch (phase) {
    case 'idle': return IDLE_FRAMES
    case 'recon': return RECON_FRAMES
    case 'challenge': return CHALLENGE_FRAMES
    case 'signing': return SIGNING_FRAMES
    case 'settling': return SETTLE_FRAMES
    case 'patching': return PATCH_FRAMES
    case 'success': return [SUCCESS_FRAME]
    case 'error': return [ERROR_FRAME]
  }
}

function delayFor(phase: TerminalPhase): number {
  switch (phase) {
    case 'recon':
    case 'settling':
    case 'patching': return 110
    default: return 520
  }
}

interface AsciiTerminalProps {
  phase?: TerminalPhase
  logs?: string[]
  title?: string
  className?: string
}

export const AsciiTerminal: React.FC<AsciiTerminalProps> = ({
  phase = 'idle',
  logs = [],
  title = 'adsec-node — live feed',
  className = '',
}) => {
  const theme = THEMES[phase]
  const frames = useMemo(() => framesFor(phase), [phase])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [phase])

  useEffect(() => {
    if (frames.length <= 1) return
    const t = setInterval(() => setIdx((i) => i + 1), delayFor(phase))
    return () => clearInterval(t)
  }, [frames.length, phase])

  const visibleLogs = logs.slice(-3)

  return (
    <div
      className={`terminal-chrome ${className}`}
      style={{
        boxShadow: `0 0 40px ${theme.glowColor}, var(--shadow-lg)`,
        transition: 'box-shadow var(--transition-slow)',
      }}
    >
      {/* Title bar with macOS dots */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="terminal-dots">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 700,
          background: theme.chipBg,
          color: theme.chipText,
          border: `1px solid ${theme.chipBorder}`,
        }}>
          {theme.label}
        </span>
      </div>

      {/* Terminal Content */}
      <div style={{ position: 'relative' }}>
        {/* CRT scanline overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 150, 0.006) 2px, rgba(0, 255, 150, 0.006) 4px)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        <pre
          aria-hidden
          style={{
            padding: '16px 20px',
            margin: 0,
            fontSize: '11px',
            lineHeight: '1.65',
            minHeight: '220px',
            whiteSpace: 'pre',
            fontFamily: 'var(--font-mono)',
            color: theme.textColor,
            transition: 'color var(--transition-default)',
            textShadow: `0 0 8px ${theme.glowColor}`,
          }}
        >
{frames[idx % frames.length]}
        </pre>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '24px',
          background: 'linear-gradient(to top, #080c14, transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Log Footer */}
      <div style={{
        borderTop: '1px solid var(--border-default)',
        background: 'rgba(0, 0, 0, 0.4)',
        padding: '10px 16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {visibleLogs.map((l, i) => (
            <div
              key={`${l}-${i}`}
              className="animate-fade-in"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: i === visibleLogs.length - 1 ? 'var(--text-secondary)' : 'var(--text-dim)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#10b981', marginRight: '8px' }}>&gt;</span>
              {l}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          marginTop: '4px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}>
            {theme.step}
          </span>
          <span className="animate-caret" style={{ color: theme.textColor, fontFamily: 'var(--font-mono)' }}>█</span>
        </div>
      </div>
    </div>
  )
}

export default AsciiTerminal
