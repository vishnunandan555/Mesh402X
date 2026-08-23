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
  text: string
  chip: string
}

const THEMES: Record<TerminalPhase, PhaseTheme> = {
  idle: { label: 'STANDBY', step: 'Ready for request', text: 'text-neutral-400', chip: 'bg-neutral-500/10 text-neutral-300 border-neutral-500/40' },
  recon: { label: 'STATIC ANALYSIS', step: 'Step 1/5 · Analyzing code structure', text: 'text-red-400', chip: 'bg-red-500/10 text-red-300 border-red-500/40' },
  challenge: { label: 'HTTP 402 CHALLENGE', step: 'Step 2/5 · Micropayment invoice generated', text: 'text-amber-300', chip: 'bg-amber-500/10 text-amber-300 border-amber-500/40' },
  signing: { label: 'WALLET SIGNATURE', step: 'Step 3/5 · Awaiting user signature', text: 'text-neutral-200', chip: 'bg-white/10 text-white border-white/25' },
  settling: { label: 'ON-CHAIN SETTLEMENT', step: 'Step 4/5 · Confirming on Algorand TestNet', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' },
  patching: { label: 'PATCH GENERATION', step: 'Step 5/5 · Creating unified diffs', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' },
  success: { label: 'VERIFIED & DELIVERED', step: 'Complete · Audit report delivered', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/40' },
  error: { label: 'INTERRUPTED', step: 'Request halted', text: 'text-red-400', chip: 'bg-red-500/10 text-red-300 border-red-500/40' },
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
  const glow =
    phase === 'success'
      ? 'shadow-emerald-500/20'
      : phase === 'error'
      ? 'shadow-red-500/20'
      : phase === 'idle'
      ? 'shadow-black/40'
      : 'shadow-black/40'

  return (
    <div className={`rounded-xl border border-white/10 bg-[#0b0b0b] shadow-2xl overflow-hidden font-mono ${glow} ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] text-neutral-400 tracking-wider">{title}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border tracking-widest uppercase ${theme.chip}`}>
          {theme.label}
        </span>
      </div>

      <div className="relative">
        <pre
          aria-hidden
          className={`px-4 py-3 text-[11px] sm:text-xs leading-snug min-h-[220px] whitespace-pre ${theme.text}`}
        >
{frames[idx % frames.length]}
        </pre>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none h-8 bg-gradient-to-t from-[#0b0b0b] to-transparent"></div>
      </div>

      <div className="border-t border-white/10 bg-black/60 px-4 py-2 space-y-0.5">
        {visibleLogs.map((l, i) => (
          <div key={`${l}-${i}`} className={`text-[11px] truncate ${i === visibleLogs.length - 1 ? 'text-neutral-300' : 'text-neutral-600'}`}>
            <span className="text-emerald-500 mr-2">&gt;</span>
            {l}
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">{theme.step}</span>
          <span className="animate-caret text-neutral-300">█</span>
        </div>
      </div>
    </div>
  )
}

export default AsciiTerminal
