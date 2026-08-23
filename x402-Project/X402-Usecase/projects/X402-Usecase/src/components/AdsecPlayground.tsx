import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { executeAdsecRequestWithPayment, AdsecResponse } from '../utils/adsecApi'
import AsciiTerminal, { TerminalPhase } from './AsciiTerminal'
import { IconAlert, IconCheck, IconCopy, IconExternal, IconShieldCheck, IconWallet } from './icons'
import { ENDPOINTS_META, EndpointMode } from '../utils/adsecEndpoints'

type AuditLanguage = 'python' | 'javascript' | 'typescript' | 'solidity'

interface CodePreset {
  id: string
  name: string
  language: AuditLanguage
  filename: string
  code: string
}

const PRESETS: CodePreset[] = [
  {
    id: 'python-sqli-secret',
    name: 'Python: SQLi & Exposed Key',
    language: 'python',
    filename: 'auth_service.py',
    code: `import os
import reqeusts  # Typosquatting package

# Hardcoded Secret Credential
OPENAI_API_KEY = "sk-proj-abc123456789012345678901234567890"

def get_user_profile(user_id):
    # SQL Injection hazard
    sql = f"SELECT * FROM users WHERE id = {user_id}"
    
    # Command Injection hazard
    os.system(f"echo Fetching user {user_id}")
    
    # Insecure deserialization
    import pickle
    state = pickle.loads(b"cos\\nsystem\\n(S'id'\\ntR.")
    
    return sql`,
  },
  {
    id: 'typosquat-supply-chain',
    name: 'Supply Chain: Malicious Package',
    language: 'python',
    filename: 'scraper.py',
    code: `import sys
import reqeusts  # Typosquatted requests
import lodash_py  # Unverified library

def fetch_data(target_url):
    response = reqeusts.get(target_url)
    return response.text`,
  },
  {
    id: 'algorand-contract',
    name: 'Algorand: Unchecked ASA Transfer',
    language: 'python',
    filename: 'asa_vault.py',
    code: `from pyteal import *

def approval_program():
    # Flaw: Unchecked ASA transfer without verifying asset opt-in
    transfer_asa = Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: Int(10458941),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1000000),
        }),
        InnerTxnBuilder.Submit(),
        Approve()
    )
    return transfer_asa`,
  },
  {
    id: 'js-xss-eval',
    name: 'JavaScript: Eval & XSS Injection',
    language: 'javascript',
    filename: 'render.js',
    code: `// Danger: Unsafe dynamic eval and XSS injection
function renderUserContent(userInput) {
    const parsed = eval("(" + userInput + ")");
    document.getElementById("container").innerHTML = userInput;
    return parsed;
}`,
  },
]

// Derived once at module load — avoids re-evaluation on every render
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'

export const AdsecPlayground: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet()
  const [mode, setMode] = useState<EndpointMode>('audit')
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id)
  const [code, setCode] = useState(PRESETS[0].code)
  const [filename, setFilename] = useState(PRESETS[0].filename)
  const [language, setLanguage] = useState<AuditLanguage>('python')

  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [terminalPhase, setTerminalPhase] = useState<TerminalPhase>('idle')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [auditResponse, setAuditResponse] = useState<AdsecResponse | null>(null)
  const [copiedDiffIdx, setCopiedDiffIdx] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: Event) => setMode((e as CustomEvent<EndpointMode>).detail)
    window.addEventListener('adsec:set-mode', handler)
    return () => window.removeEventListener('adsec:set-mode', handler)
  }, [])

  const pushLog = (line: string) => setTerminalLogs((prev) => [...prev.slice(-8), line])

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setSelectedPreset(preset.id)
      setCode(preset.code)
      setFilename(preset.filename)
      setLanguage(preset.language)
      setAuditResponse(null)
      setError('')
      setHasStarted(false)
      setTerminalPhase('idle')
      setTerminalLogs([])
    }
  }

  const beginRun = () => {
    setHasStarted(true)
    setLoading(true)
    setError('')
    setAuditResponse(null)
    setTerminalLogs([])
    setTerminalPhase('recon')
    const meta = ENDPOINTS_META[mode]
    pushLog(`Target: ${filename} (${(new TextEncoder().encode(code).length / 1024).toFixed(1)} KB ${language})`)
    pushLog(`Endpoint: POST ${meta.path} (${meta.name})`)
  }

  const finishSuccess = (data: AdsecResponse) => {
    setAuditResponse(data)
    if (data.fixes && data.fixes.length > 0 && (mode === 'remediate' || mode === 'audit')) {
      setTerminalPhase('patching')
      pushLog(`Generated ${data.fixes.length} git patch(es) ready to apply`)
      setTimeout(() => {
        setTerminalPhase('success')
        setLoading(false)
        pushLog(
          `Audit complete · Score: ${data.summary?.score ?? '—'}/100 · Findings: ${data.findings?.length ?? 0} · Proof recorded: ${
            data.attestation ? 'Yes' : 'No'
          }`,
        )
      }, 1400)
    } else {
      setTerminalPhase('success')
      setLoading(false)
      pushLog(`Audit complete · Score: ${data.summary?.score ?? '—'}/100 · Findings: ${data.findings?.length ?? 0}`)
    }
  }

  const handleExecuteAudit = async () => {
    if (!activeAddress) {
      setError('Please connect your Algorand wallet (Pera, Defly, or Lute) to sign the payment.')
      return
    }

    if (!signTransactions) {
      setError('Connected wallet does not support transaction signing.')
      return
    }

    beginRun()

    const endpointUrl = `${API_BASE_URL}${ENDPOINTS_META[mode].path}`
    const meta = ENDPOINTS_META[mode]

    try {
      const signer = {
        address: activeAddress,
        signTransactions,
      }

      const response = await executeAdsecRequestWithPayment(
        endpointUrl,
        {
          code,
          filename,
          language,
          tier: mode === 'scan' || mode === 'attest' ? 'tier1' : 'tier2',
        },
        signer,
        (step) => {
          if (step === 'challenging') {
            setTerminalPhase('challenge')
            pushLog(`Received HTTP 402 challenge (${meta.price})`)
          } else if (step === 'signing') {
            setTerminalPhase('signing')
            pushLog('Waiting for transaction signature in wallet...')
          } else if (step === 'settling') {
            setTerminalPhase('settling')
            pushLog('Settling payment on Algorand TestNet via GoPlausible...')
          } else if (step === 'done') {
            pushLog('Payment confirmed on Algorand · Delivering results')
          }
        },
      )

      finishSuccess(response)
    } catch (err) {
      // eslint-disable-next-line no-console -- surfaces payment failures for debugging
      console.error('ADSEC execution error:', err)
      const message =
        err instanceof Error && err.message
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Audit request could not be completed.'
      setError(message)
      setTerminalPhase('error')
      setLoading(false)
      pushLog(`Error: ${message.slice(0, 52)}`)
    }
  }

  const handleCopyDiff = (diffText: string, idx: number) => {
    navigator.clipboard.writeText(diffText)
    setCopiedDiffIdx(idx)
    setTimeout(() => setCopiedDiffIdx(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Preset Selector & Code Input */}
      <div className="bg-base-900/70 border border-base-800 rounded-2xl p-5 shadow-node">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <label className="text-sm font-semibold text-base-200">Sample vulnerability presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                aria-pressed={selectedPreset === p.id}
                className={`text-xs px-3 py-1.5 rounded-md border transition-all duration-200 font-medium focus-ring active:scale-[0.98] ${
                  selectedPreset === p.id
                    ? 'bg-accent text-base-ink border-accent shadow-glow'
                    : 'bg-transparent text-base-400 border-base-700 hover:border-base-500 hover:text-base-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Box */}
        <div className="relative rounded-xl overflow-hidden border border-base-800 bg-base-ink focus-within:border-accent/50 transition-colors duration-200">
          <div className="bg-base-900/70 px-4 py-2 flex justify-between items-center border-b border-base-800 text-xs font-mono text-base-400">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
              <span className="text-base-200 font-semibold">{filename}</span>
            </span>
            <span className="uppercase text-base-500 font-medium tracking-wide">{language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            spellCheck={false}
            aria-label={`Source code for ${filename}`}
            className="w-full bg-base-ink p-4 font-mono text-sm text-base-200 resize-y leading-relaxed thin-scroll focus:outline-none"
            placeholder="Paste source code to audit..."
          />
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-base-400 font-mono tnum">
            Selected service: <span className="font-semibold text-base-200">{ENDPOINTS_META[mode].name}</span> ({ENDPOINTS_META[mode].path})
            · Cost: <span className="text-accent font-semibold">{ENDPOINTS_META[mode].price}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            <button
              onClick={handleExecuteAudit}
              disabled={loading || !activeAddress}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus-ring ${
                loading
                  ? 'bg-base-700 cursor-not-allowed text-base-300'
                  : !activeAddress
                    ? 'bg-base-800 text-base-500 border border-base-700 cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-bright text-base-ink shadow-glow active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-caret font-mono">█</span>
                  <span>Processing x402 audit…</span>
                </>
              ) : (
                <>
                  <span>{activeAddress ? 'Run paid audit' : 'Run paid audit'}</span>
                  <span className="text-xs bg-base-ink/25 px-2 py-0.5 rounded-md font-mono tnum">{ENDPOINTS_META[mode].price}</span>
                </>
              )}
            </button>
            {!activeAddress && (
              <p className="text-xs text-base-400 flex items-center gap-1.5">
                <IconWallet size={13} />
                Connect a wallet to authorize $0.001 USDC
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Live ASCII Terminal */}
      {hasStarted && <AsciiTerminal phase={terminalPhase} logs={terminalLogs} title={`Audit Telemetry — ${filename}`} />}

      {/* Error Alert */}
      {error && (
        <div role="alert" className="bg-red-500/[0.07] border border-red-500/30 rounded-xl p-4 text-red-200 text-sm flex items-start gap-3">
          <IconAlert size={17} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Request failed.</span> <span className="text-red-200/80">{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {auditResponse && (
        <div className="space-y-6">
          {/* Score Header Card */}
          {auditResponse.summary && (
            <div className="bg-base-900/70 border border-base-800 rounded-2xl p-6 shadow-node flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-semibold text-3xl border tnum ${
                    auditResponse.summary.score >= 80
                      ? 'bg-accent/10 text-accent border-accent/50 shadow-glow'
                      : auditResponse.summary.score >= 50
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                        : 'bg-red-500/10 text-red-300 border-red-500/40'
                  }`}
                >
                  <span>{auditResponse.summary.score}</span>
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-75">/ 100</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-base-100">Security health rating</h3>
                  <p className="text-xs text-base-400 font-mono mt-1 tnum">
                    Analyzed in {auditResponse.summary.durationMs}ms · {ENDPOINTS_META[mode].name}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-4 gap-3 text-center w-full md:w-auto">
                <div className="bg-red-500/[0.07] border border-red-500/25 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-display font-semibold text-red-400 tnum">{auditResponse.summary.critical}</div>
                  <div className="text-[10px] uppercase font-medium text-red-300/70">Critical</div>
                </div>
                <div className="bg-amber-500/[0.07] border border-amber-500/25 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-display font-semibold text-amber-400 tnum">{auditResponse.summary.high}</div>
                  <div className="text-[10px] uppercase font-medium text-amber-300/70">High</div>
                </div>
                <div className="bg-yellow-500/[0.07] border border-yellow-500/25 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-display font-semibold text-yellow-400 tnum">{auditResponse.summary.medium}</div>
                  <div className="text-[10px] uppercase font-medium text-yellow-300/70">Medium</div>
                </div>
                <div className="bg-base-800/60 border border-base-700 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-display font-semibold text-base-300 tnum">{auditResponse.summary.low}</div>
                  <div className="text-[10px] uppercase font-medium text-base-500">Low</div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Attestation Badge */}
          {auditResponse.attestation && (
            <div className="bg-accent/[0.04] border border-accent/30 rounded-2xl p-5 shadow-node text-base-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h4 className="font-semibold text-accent flex items-center gap-2.5">
                  <IconShieldCheck size={16} />
                  On-chain audit certificate
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-base-ink text-accent font-mono px-2.5 py-1 rounded-md border border-accent/35 tnum">
                    {auditResponse.attestation.status === 'VERIFIED_ON_CHAIN' ? 'Confirmed on Algorand' : auditResponse.attestation.status}
                  </span>
                  {auditResponse.attestation.txId && (
                    <a
                      href={
                        auditResponse.attestation.loraUrl || `https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs hover:bg-accent/15 text-accent px-3 py-1 rounded-md transition-all duration-200 focus-ring flex items-center gap-1.5 font-mono"
                    >
                      Lora explorer <IconExternal size={11} />
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono text-base-300 bg-base-ink p-3.5 rounded-xl border border-base-800 overflow-x-auto thin-scroll tnum">
                <div>
                  <span className="text-base-500">SHA-256 code hash:</span>{' '}
                  <span className="text-accent">{auditResponse.attestation.codeHash}</span>
                </div>
                <div>
                  <span className="text-base-500">Note format:</span>{' '}
                  <span className="text-base-200">{auditResponse.attestation.txNoteSchema}</span>
                </div>
                {auditResponse.attestation.txId && (
                  <div>
                    <span className="text-base-500">Transaction ID: </span>
                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:text-accent-bright hover:underline focus-ring rounded-sm font-medium break-all"
                    >
                      {auditResponse.attestation.txId}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-base-500">Verification authority:</span> {auditResponse.attestation.attestationAuthority}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Findings List */}
          {auditResponse.findings && auditResponse.findings.length > 0 && (
            <div className="bg-base-900/70 border border-base-800 rounded-2xl p-5 shadow-node space-y-4">
              <h3 className="font-display text-lg font-semibold text-base-100 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true"></span>
                Identified issues ({auditResponse.findings.length})
              </h3>
              <div className="space-y-3">
                {auditResponse.findings.map((finding, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-base-800 bg-base-ink/70 space-y-2.5">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md uppercase font-mono border ${
                            finding.severity === 'critical'
                              ? 'bg-red-500/[0.08] text-red-400 border-red-500/30'
                              : finding.severity === 'high'
                                ? 'bg-amber-500/[0.08] text-amber-400 border-amber-500/30'
                                : 'bg-yellow-500/[0.08] text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="font-semibold text-base-100 text-sm">{finding.title}</span>
                      </div>
                      {finding.cweId && (
                        <span className="text-xs font-mono bg-base-800 text-base-200 px-2 py-0.5 rounded-md tnum">{finding.cweId}</span>
                      )}
                    </div>

                    {finding.line && (
                      <div className="text-xs font-mono text-base-400 tnum">
                        Line {finding.line}: <code className="bg-base-800 px-1.5 py-0.5 rounded-md text-accent">{finding.snippet}</code>
                      </div>
                    )}

                    {finding.remediation && (
                      <div className="text-xs text-base-300 bg-base-900/70 p-2.5 rounded-lg border border-base-800">
                        <span className="font-semibold text-accent font-mono">Recommended fix:</span> {finding.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Unified Git Diff Fixes */}
          {auditResponse.fixes && auditResponse.fixes.length > 0 && (
            <div className="bg-base-900/70 border border-base-800 rounded-2xl p-5 shadow-node space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-display text-lg font-semibold text-base-100 flex items-center gap-2.5">
                  <IconCheck size={16} className="text-accent" />
                  Ready-to-apply git patches ({auditResponse.fixes.length})
                </h3>
                <span className="text-xs text-base-500 font-mono">Apply with `git apply`</span>
              </div>

              <div className="space-y-4">
                {auditResponse.fixes.map((fix, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-base-800 bg-base-ink">
                    <div className="bg-base-900/70 px-4 py-2 flex justify-between items-center text-xs font-mono text-base-400 border-b border-base-800 tnum">
                      <span>
                        Patch {idx + 1} of {auditResponse.fixes?.length}
                      </span>
                      <button
                        onClick={() => handleCopyDiff(fix.diff, idx)}
                        className="flex items-center gap-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-base-ink px-3 py-1 rounded-md transition-all duration-200 focus-ring active:scale-[0.98] text-xs font-medium"
                      >
                        {copiedDiffIdx === idx ? <IconCheck size={12} /> : <IconCopy size={12} />}
                        {copiedDiffIdx === idx ? 'Copied' : 'Copy patch'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-accent/90 overflow-x-auto leading-relaxed thin-scroll">
                      <code>{fix.diff}</code>
                    </pre>
                    {fix.explanation && (
                      <div className="bg-base-900/50 p-3 border-t border-base-800 text-xs text-base-400 leading-relaxed">
                        <span className="font-semibold text-accent">Why this fix works:</span> {fix.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Chain Receipt */}
          {auditResponse.receipt && (
            <div className="bg-base-900/70 border border-base-800 rounded-xl p-4 text-xs font-mono text-base-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 tnum">
              <div>
                <span>Network: </span>
                <span className="text-base-200 font-semibold">{auditResponse.receipt.network || 'Algorand TestNet'}</span>
                {auditResponse.receipt.paidAmount && (
                  <span className="ml-2 bg-accent/10 text-accent px-2 py-0.5 rounded-md border border-accent/30">
                    Paid {auditResponse.receipt.paidAmount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                Settled via GoPlausible facilitator ·
                <a
                  href={
                    auditResponse.receipt.attestationTxId
                      ? `https://lora.algokit.io/testnet/transaction/${auditResponse.receipt.attestationTxId}`
                      : auditResponse.receipt.txId
                        ? `https://lora.algokit.io/testnet/transaction/${auditResponse.receipt.txId}`
                        : 'https://lora.algokit.io/testnet'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-bright hover:underline focus-ring rounded-sm flex items-center gap-1.5 font-semibold"
                >
                  Verify transaction on Lora <IconExternal size={11} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdsecPlayground
