import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { executeAdsecRequestWithPayment, AdsecResponse } from '../utils/adsecApi'
import AsciiTerminal, { TerminalPhase } from './AsciiTerminal'
import { ENDPOINTS_META, ENDPOINT_ORDER, EndpointMode } from '../utils/adsecEndpoints'

const PRESETS = [
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
  const [language, setLanguage] = useState<'python' | 'javascript' | 'typescript' | 'solidity'>('python')

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
      setLanguage(preset.language as any)
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
          }`
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
        }
      )

      finishSuccess(response)
    } catch (err: any) {
      console.error('ADSEC execution error:', err)
      setError(err?.message || 'Audit request could not be completed.')
      setTerminalPhase('error')
      setLoading(false)
      pushLog(`Error: ${(err?.message || 'Request cancelled or failed').slice(0, 52)}`)
    }
  }

  const handleExecuteFreeDevAudit = async () => {
    beginRun()
    pushLog('Running in Dev Mode (bypassing on-chain payment rail)')

    try {
      const res = await fetch(`${API_BASE_URL}/adsec/dev-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          filename,
          language,
          tier: mode === 'scan' || mode === 'attest' ? 'tier1' : 'tier2',
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`)
      }

      const data = await res.json()
      pushLog('Audit completed successfully')
      finishSuccess(data)
    } catch (err: any) {
      console.error('Dev audit error:', err)
      setError(err?.message || 'Failed to complete free dev audit.')
      setTerminalPhase('error')
      setLoading(false)
      pushLog(`Error: ${(err?.message || 'Request failed').slice(0, 52)}`)
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
      <div className="bg-slate-900/70 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">▸</span> Sample Vulnerability Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  selectedPreset === p.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Box */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#05070d]">
          <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 text-slate-300 font-bold">{filename}</span>
            </span>
            <span className="uppercase text-indigo-400 font-semibold tracking-wider">{language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full bg-[#05070d] p-4 font-mono text-sm text-emerald-300 focus:outline-none resize-y leading-relaxed thin-scroll"
            placeholder="Paste source code to audit..."
          />
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Selected Service: <span className="font-bold text-slate-200">{ENDPOINTS_META[mode].name}</span> ({ENDPOINTS_META[mode].path}) · Cost:{' '}
            <span className="text-amber-300 font-bold">{ENDPOINTS_META[mode].price}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleExecuteFreeDevAudit}
              disabled={loading}
              className={`px-5 py-3 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 active:scale-95 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Test the audit engine without requiring an Algorand wallet transaction"
            >
              <span>Run Free Test (Dev Mode)</span>
            </button>

            <button
              onClick={handleExecuteAudit}
              disabled={loading || !activeAddress}
              className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-600 cursor-not-allowed'
                  : !activeAddress
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-caret font-mono">█</span>
                  <span>Processing x402 Audit...</span>
                </>
              ) : (
                <>
                  Run Paid Audit
                  <span className="text-xs bg-indigo-900/80 px-2 py-0.5 rounded-md font-mono">
                    {ENDPOINTS_META[mode].price}
                  </span>
                </>
              )}
            </button>
            {!activeAddress && (
              <p className="text-xs text-amber-400/80 font-mono mt-2">
                Connect your Algorand wallet via the header button to enable live paid audits.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Live ASCII Terminal */}
      {hasStarted && (
        <AsciiTerminal phase={terminalPhase} logs={terminalLogs} title={`Audit Telemetry — ${filename}`} />
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm flex items-center gap-2 font-mono">
          <span className="text-red-400 font-bold">Notice:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {auditResponse && (
        <div className="space-y-6">
          {/* Score Header Card */}
          {auditResponse.summary && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border ${
                    auditResponse.summary.score >= 80
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-950/60'
                      : auditResponse.summary.score >= 50
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-lg shadow-amber-950/60'
                      : 'bg-red-950/80 text-red-300 border-red-500 shadow-lg shadow-red-950/60'
                  }`}
                >
                  <span>{auditResponse.summary.score}</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">/ 100</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Security Health Rating</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Analyzed in {auditResponse.summary.durationMs}ms · {ENDPOINTS_META[mode].name}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-4 gap-3 text-center w-full md:w-auto">
                <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-red-400">{auditResponse.summary.critical}</div>
                  <div className="text-[10px] uppercase font-bold text-red-300/80">Critical</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-amber-400">{auditResponse.summary.high}</div>
                  <div className="text-[10px] uppercase font-bold text-amber-300/80">High</div>
                </div>
                <div className="bg-yellow-950/50 border border-yellow-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-yellow-400">{auditResponse.summary.medium}</div>
                  <div className="text-[10px] uppercase font-bold text-yellow-300/80">Medium</div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-slate-300">{auditResponse.summary.low}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Low</div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Attestation Badge */}
          {auditResponse.attestation && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  On-Chain Audit Certificate
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-3 py-1 rounded-full border border-emerald-500/40 font-bold">
                    {auditResponse.attestation.status === 'VERIFIED_ON_CHAIN' ? 'Confirmed on Algorand' : auditResponse.attestation.status}
                  </span>
                  {auditResponse.attestation.txId && (
                    <a
                      href={auditResponse.attestation.loraUrl || `https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1 rounded-full border border-indigo-500/40 transition-all flex items-center gap-1 font-mono font-bold"
                    >
                      View on Lora Explorer ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">SHA-256 Code Hash:</span> <span className="text-emerald-400">{auditResponse.attestation.codeHash}</span></div>
                <div><span className="text-slate-500">Note Format:</span> <span className="text-indigo-300">{auditResponse.attestation.txNoteSchema}</span></div>
                {auditResponse.attestation.txId && (
                  <div>
                    <span className="text-slate-500">Transaction ID: </span>
                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      {auditResponse.attestation.txId}
                    </a>
                  </div>
                )}
                <div><span className="text-slate-500">Verification Authority:</span> {auditResponse.attestation.attestationAuthority}</div>
              </div>
            </div>
          )}

          {/* Detailed Findings List */}
          {auditResponse.findings && auditResponse.findings.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="font-mono text-red-400">●</span> Identified Issues ({auditResponse.findings.length})
              </h3>
              <div className="space-y-3">
                {auditResponse.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-800 bg-[#05070d]/70 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                            finding.severity === 'critical'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/40'
                              : finding.severity === 'high'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                              : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="font-bold text-white text-sm">{finding.title}</span>
                      </div>
                      {finding.cweId && (
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {finding.cweId}
                        </span>
                      )}
                    </div>

                    {finding.line && (
                      <div className="text-xs font-mono text-slate-400">
                        Line {finding.line}: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">{finding.snippet}</code>
                      </div>
                    )}

                    {finding.remediation && (
                      <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="font-bold text-emerald-400 font-mono">Recommended Fix:</span> {finding.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Unified Git Diff Fixes */}
          {auditResponse.fixes && auditResponse.fixes.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="font-mono text-emerald-400">✓</span> Ready-to-Apply Git Patches ({auditResponse.fixes.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">Apply with `git apply`</span>
              </div>

              <div className="space-y-4">
                {auditResponse.fixes.map((fix, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070d]">
                    <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800">
                      <span>Patch {idx + 1} of {auditResponse.fixes?.length}</span>
                      <button
                        onClick={() => handleCopyDiff(fix.diff, idx)}
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1 rounded transition-all text-xs font-medium"
                      >
                        {copiedDiffIdx === idx ? 'Copied ✓' : 'Copy Patch'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed thin-scroll">
                      <code>{fix.diff}</code>
                    </pre>
                    {fix.explanation && (
                      <div className="bg-slate-900/60 p-3 border-t border-slate-800 text-xs text-slate-400">
                        <span className="font-bold text-indigo-300 font-mono">Why this fix works:</span> {fix.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Chain Receipt */}
          {auditResponse.receipt && (
            <div className="bg-[#05070d] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span>Network: </span>
                <span className="text-slate-200 font-semibold">{auditResponse.receipt.network || 'Algorand TestNet'}</span>
                {auditResponse.receipt.paidAmount && (
                  <span className="ml-2 bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                    Paid {auditResponse.receipt.paidAmount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                Settled via GoPlausible Facilitator ·
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
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                >
                  Verify Transaction on Lora ↗
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

