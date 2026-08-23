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
  const labels = ['SQLi', 'XSS ', 'KEY ', 'RCE ']
  const headers = [
    '[*] loading ruleset ......... 42 rules',
    '[*] tracing dataflow ........ depth 9',
    '[*] correlating OSV.dev CVEs',
  ]
  const frames: string[] = []
  for (let p = 0; p <= W; p++) {
    const header = headers[Math.min(headers.length - 1, Math.floor((p / (W + 1)) * headers.length))]
    const rows = labels.map((l) => `[${l}] ${'.'.repeat(p)}=>${'>'.repeat(W - p)}`)
    frames.push([header, '', ...rows, ''].join('\n'))
  }
  frames.push(
    ['', '[!] threats engaged @ ADSEC wall', '', ...labels.map((l) => `[${l}] ${'#'.repeat(W)}||`), ''].join('\n')
  )
  return frames
}

function settleFrames(): string[] {
  const total = 15
  const frames: string[] = []
  for (let i = 0; i <= total; i++) {
    const bar = `${'#'.repeat(i)}${i === total ? '' : '*'}${'.'.repeat(Math.max(0, total - i - 1))}`
    const status = i === total ? 'FINAL CONFIRMED' : `confirming.. ${(i / total * 100).toFixed(0)}%`
    frames.push(
      [
        'wallet ==> mempool ==> ALGORAND',
        '',
        'round  #48,201,334',
        `[${bar}]  ${status}`,
        '',
        'note  : adsec-attest:v1',
      ].join('\n')
    )
  }
  return frames
}

const IDLE_FRAMES = [
  [
    'intruder$ nmap -sS adsec-node:4021',
    '',
    '[probe] =============>',
    '[probe] =============>',
    '[probe] =============>',
    '',
    'sweeping perimeter...',
  ].join('\n'),
  [
    'intruder$ nmap -sS adsec-node:4021',
    '',
    '[probe] ......#####...',
    '[probe] ......#####...',
    '[probe] ......#####...',
    '',
    'REFUSED by ADSEC firewall',
  ].join('\n'),
  [
    'intruder$ nmap -sS adsec-node:4021',
    '',
    '   .------------------.',
    "   |   NODE SECURE    |",
    "   '------------------'",
    '',
    'listening :4021 for x402 calls',
  ].join('\n'),
]

const RECON_FRAMES = attackFrames()

const CHALLENGE_FRAMES = [
  [
    '> POST /adsec/audit HTTP/1.1',
    '> content-type: application/json',
    '',
    '< HTTP/1.1 402 PAYMENT REQUIRED',
    '< price : $0.001 USDC ASA#10458941',
    '< via   : goplausible facilitator',
    '',
    '+------------------------------+',
    '| awaiting wallet signature _  |',
    '+------------------------------+',
  ].join('\n'),
  [
    '> POST /adsec/audit HTTP/1.1',
    '> content-type: application/json',
    '',
    '< HTTP/1.1 402 PAYMENT REQUIRED',
    '< price : $0.001 USDC ASA#10458941',
    '< via   : goplausible facilitator',
    '',
    '+------------------------------+',
    "| awaiting wallet signature    |",
    '+------------------------------+',
  ].join('\n'),
]

const SIGNING_FRAMES = [
  [
    '.-----------------------------.',
    '| PERA / DEFLY WALLET         |',
    '| network: algorand-testnet   |',
    '| fee    : 0.001 ALGO         |',
    '| sign txn? ............... Y<|',
    "'-----------------------------'",
    '           |',
    '           v',
    'sig ed25519 :: 7xKq****9fQ=',
  ].join('\n'),
  [
    '.-----------------------------.',
    '| PERA / DEFLY WALLET         |',
    '| network: algorand-testnet   |',
    '| fee    : 0.001 ALGO         |',
    '| sign txn? ............... Y<|',
    "'-----------------------------'",
    '           |',
    '           v',
    'sig ed25519 :: mR2v****kQ8z',
  ].join('\n'),
]

const SETTLE_FRAMES = settleFrames()

const PATCH_FRAMES = [
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- sql = f"SELECT * FROM users',
    '-      WHERE id = {user_id}"',
    '+ sql = "SELECT * FROM users',
    '+      WHERE id = %s", user_id',
    '',
    'applying hunk 1/3 ... ok',
  ].join('\n'),
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- OPENAI_API_KEY = "sk-proj-abc"',
    '+ OPENAI_API_KEY = os.environ[',
    '+   "OPENAI_API_KEY"]',
    '',
    'applying hunk 2/3 ... ok',
  ].join('\n'),
  [
    '--- a/auth_service.py',
    '+++ b/auth_service.py',
    '',
    '- import reqeusts',
    '+ import requests',
    '',
    'git apply --check ... PASS',
  ].join('\n'),
]

const SUCCESS_FRAME = [
  '          ______________',
  '         /              \\',
  '        /    DEFENDED    \\',
  '       |                  |',
  '       |   score -> 96    |',
  '       |   patches applied|',
  '       |   proof on-chain |',
  '        \\                /',
  '         \\______________/',
].join('\n')

const ERROR_FRAME = [
  '!! x402 flow halted !!',
  '',
  ' > upstream unreachable?',
  ' > insufficient balance?',
  ' > wallet rejected signing?',
  '',
  'review and retry_',
].join('\n')

interface PhaseTheme {
  label: string
  step: string
  text: string
  chip: string
}

const THEMES: Record<TerminalPhase, PhaseTheme> = {
  idle: { label: 'PERIMETER WATCH', step: 'standby', text: 'text-slate-400', chip: 'bg-slate-500/10 text-slate-300 border-slate-500/40' },
  recon: { label: 'THREAT SWEEP', step: 'step 1/5 · analyzing target', text: 'text-red-400', chip: 'bg-red-500/10 text-red-300 border-red-500/40' },
  challenge: { label: 'HTTP 402 CHALLENGE', step: 'step 2/5 · payment required', text: 'text-amber-300', chip: 'bg-amber-500/10 text-amber-300 border-amber-500/40' },
  signing: { label: 'WALLET SIGNATURE', step: 'step 3/5 · signing micropayment', text: 'text-sky-300', chip: 'bg-sky-500/10 text-sky-300 border-sky-500/40' },
  settling: { label: 'ON-CHAIN SETTLEMENT', step: 'step 4/5 · algorand testnet', text: 'text-cyan-300', chip: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40' },
  patching: { label: 'AUTO-PATCH', step: 'step 5/5 · applying git diffs', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' },
  success: { label: 'NODE SECURE', step: 'complete · report delivered', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/40' },
  error: { label: 'FLOW HALTED', step: 'error', text: 'text-red-400', chip: 'bg-red-500/10 text-red-300 border-red-500/40' },
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
      ? 'shadow-indigo-500/10'
      : 'shadow-black/40'

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#05070d] shadow-2xl overflow-hidden font-mono ${glow} ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/90"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/90"></span>
          </span>
          <span className="text-[11px] text-slate-400 tracking-wider">{title}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded border tracking-widest uppercase ${theme.chip}`}>
          {theme.label}
        </span>
      </div>

      <div className="relative">
        <pre
          aria-hidden
          className={`crt px-4 py-3 text-[11px] sm:text-xs leading-snug min-h-[220px] whitespace-pre ${theme.text}`}
        >
{frames[idx % frames.length]}
        </pre>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none h-8 bg-gradient-to-t from-[#05070d] to-transparent"></div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/90 px-4 py-2 space-y-0.5">
        {visibleLogs.map((l, i) => (
          <div key={`${l}-${i}`} className={`text-[11px] truncate ${i === visibleLogs.length - 1 ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className="text-indigo-400 mr-2">&gt;</span>
            {l}
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">{theme.step}</span>
          <span className="animate-caret text-slate-300">█</span>
        </div>
      </div>
    </div>
  )
}

export default AsciiTerminal
