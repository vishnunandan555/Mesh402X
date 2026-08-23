import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { executeAdsecRequestWithPayment, AdsecResponse } from '../utils/adsecApi'
import AsciiTerminal, { TerminalPhase } from './AsciiTerminal'
import { ENDPOINTS_META, ENDPOINT_ORDER, EndpointMode } from '../utils/adsecEndpoints'

const PRESETS = [
  {
    id: 'python-sqli-secret',
    name: 'Python: SQLi & Secret Key',
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
    name: 'Python: Supply Chain Typosquat',
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
    name: 'JavaScript: Eval & XSS Sink',
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
    setLoading(true)
    setHasStarted(true)
    setError('')
    setAuditResponse(null)
    setTerminalPhase('recon')
    setTerminalLogs([
      `Initializing security audit for ${filename}...`,
      'Preparing AST parsing pipeline and CVE search queries...',
    ])
  }

  const finishSuccess = (response: AdsecResponse) => {
    setAuditResponse(response)
    setTerminalPhase(response.fixes && response.fixes.length > 0 ? 'patching' : 'success')
    setLoading(false)
    pushLog('Audit completed · Structured findings rendered below')
  }

  const handleExecuteAudit = async () => {
    if (!activeAddress) {
      setError('Please connect your Algorand wallet first to authorize the $0.001 USDC micropayment.')
      return
    }

    beginRun()

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com'
      const endpointUrl = `${backendUrl.replace(/\/$/, '')}${ENDPOINTS_META[mode].path}`

      const response = await executeAdsecRequestWithPayment(
        endpointUrl,
        {
          code,
          filename,
          language,
          tier: mode === 'scan' || mode === 'attest' ? 'tier1' : 'tier2',
        },
        {
          address: activeAddress,
          signTransactions,
        },
        (step) => {
          if (step === 'challenging') {
            setTerminalPhase('challenge')
            pushLog(`Received HTTP 402 challenge (${ENDPOINTS_META[mode].price})`)
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

  const handleCopyDiff = (diffText: string, idx: number) => {
    navigator.clipboard.writeText(diffText)
    setCopiedDiffIdx(idx)
    setTimeout(() => setCopiedDiffIdx(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Symmetrical Card 1: Preset & Service Selection */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
            [A] Sample Vulnerability Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                  selectedPreset === p.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070d]">
          <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-800 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span className="text-slate-300 font-bold">{filename}</span>
            </span>
            <span className="uppercase text-indigo-400 font-mono text-[11px]">{language}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full bg-[#05070d] p-4 font-mono text-xs sm:text-sm text-emerald-300 focus:outline-none resize-y leading-relaxed"
            placeholder="Paste source code to audit..."
          />
        </div>

        {/* Service Selector & Run Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase mr-1">Target Service:</span>
            {ENDPOINT_ORDER.map((key) => {
              const meta = ENDPOINTS_META[key]
              return (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                    mode === key
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 font-bold'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {meta.cardBadge} ({meta.price})
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExecuteAudit}
              disabled={loading || !activeAddress}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold font-mono text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-700 cursor-not-allowed'
                  : !activeAddress
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-95'
              }`}
            >
              {loading ? (
                <span>[Processing x402 Payment...]</span>
              ) : (
                <>
                  <span>Run Paid Audit</span>
                  <span className="text-[10px] bg-indigo-950 text-amber-300 px-1.5 py-0.5 rounded border border-indigo-800">
                    {ENDPOINTS_META[mode].price}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live ASCII Terminal Telemetry */}
      {hasStarted && (
        <AsciiTerminal phase={terminalPhase} logs={terminalLogs} title={`Audit Telemetry — ${filename}`} />
      )}

      {/* Error Notice */}
      {error && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-4 text-red-200 text-xs font-mono flex items-center gap-2">
          <span className="text-red-400 font-bold">[Error]:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Symmetrical Results Section */}
      {auditResponse && (
        <div className="space-y-6">
          {/* Summary Score Header */}
          {auditResponse.summary && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl font-mono border ${
                    auditResponse.summary.score >= 80
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                      : auditResponse.summary.score >= 50
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                      : 'bg-red-950/80 text-red-300 border-red-500'
                  }`}
                >
                  <span>{auditResponse.summary.score}</span>
                  <span className="text-[9px] font-mono text-slate-400">/ 100</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Security Health Score</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Evaluated against 42 AST vulnerability patterns & live OSV.dev CVE database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-2 px-3">
                  <div className="text-lg font-bold text-red-400">{auditResponse.summary.critical}</div>
                  <div className="text-[9px] uppercase text-red-300/80">Critical</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-2 px-3">
                  <div className="text-lg font-bold text-amber-400">{auditResponse.summary.high}</div>
                  <div className="text-[9px] uppercase text-amber-300/80">High</div>
                </div>
                <div className="bg-yellow-950/50 border border-yellow-500/30 rounded-xl p-2 px-3">
                  <div className="text-lg font-bold text-yellow-400">{auditResponse.summary.medium}</div>
                  <div className="text-[9px] uppercase text-yellow-300/80">Medium</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 px-3">
                  <div className="text-lg font-bold text-slate-300">{auditResponse.summary.low}</div>
                  <div className="text-[9px] uppercase text-slate-400">Low</div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Attestation Badge */}
          {auditResponse.attestation && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-emerald-400 font-mono text-sm">
                  [+] On-Chain Cryptographic Certificate
                </h4>
                {auditResponse.attestation.txId && (
                  <a
                    href={auditResponse.attestation.loraUrl || `https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1 rounded-full border border-indigo-500/40 transition-all font-mono font-bold"
                  >
                    View on Lora Explorer
                  </a>
                )}
              </div>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">SHA-256 Code Hash:</span> <span className="text-emerald-400">{auditResponse.attestation.codeHash}</span></div>
                <div><span className="text-slate-500">Transaction ID:</span> <span className="text-indigo-300">{auditResponse.attestation.txId}</span></div>
              </div>
            </div>
          )}

          {/* Findings List */}
          {auditResponse.findings && auditResponse.findings.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white font-mono">
                [!] Identified Flaws ({auditResponse.findings.length})
              </h3>
              <div className="space-y-2.5">
                {auditResponse.findings.map((finding, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-[#05070d] space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-white text-xs font-mono">{finding.title}</span>
                      <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-300 border border-red-500/40 px-2 py-0.5 rounded">
                        {finding.severity}
                      </span>
                    </div>
                    {finding.snippet && (
                      <div className="text-xs font-mono text-slate-400">
                        Line {finding.line}: <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">{finding.snippet}</code>
                      </div>
                    )}
                    {finding.remediation && (
                      <div className="text-xs text-slate-400 font-mono">
                        <span className="text-emerald-400 font-bold">Fix:</span> {finding.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Git Diff Patches */}
          {auditResponse.fixes && auditResponse.fixes.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white font-mono">
                  [+] Unified Git Patches ({auditResponse.fixes.length})
                </h3>
                <span className="text-xs text-slate-500 font-mono">git apply compatible</span>
              </div>

              <div className="space-y-3">
                {auditResponse.fixes.map((fix, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070d]">
                    <div className="bg-slate-950 px-4 py-1.5 flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800">
                      <span>Patch {idx + 1}</span>
                      <button
                        onClick={() => handleCopyDiff(fix.diff, idx)}
                        className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-0.5 rounded text-xs font-mono"
                      >
                        {copiedDiffIdx === idx ? '[Copied]' : 'Copy Diff'}
                      </button>
                    </div>
                    <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                      <code>{fix.diff}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdsecPlayground
