import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { executeAdsecRequestWithPayment, AdsecResponse } from '../utils/adsecApi'

const PRESETS = [
  {
    id: 'python-sqli-secret',
    name: 'Python: SQLi + Leaked Key',
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
    name: 'Supply-Chain: Typosquatting Attack',
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
    name: 'Algorand: PyTeAL Opt-In Vulnerability',
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
    name: 'JavaScript: XSS & Dynamic Eval',
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

type EndpointMode = 'scan' | 'remediate' | 'attest' | 'audit'

const ENDPOINTS_META: Record<
  EndpointMode,
  { path: string; name: string; price: string; cardBadge: string; desc: string }
> = {
  scan: {
    path: '/adsec/scan',
    name: 'Pre-Flight Scanner',
    price: '$0.01 USDC',
    cardBadge: 'Card 1',
    desc: 'Fast deterministic check for leaked secrets, AST patterns, typosquatting and live OSV.dev CVEs.',
  },
  remediate: {
    path: '/adsec/remediate',
    name: 'Auto-Remediation Node',
    price: '$0.03 USDC',
    cardBadge: 'Card 2',
    desc: 'Generates language-aware unified Git diff patches (git apply ready) to fix code flaws.',
  },
  attest: {
    path: '/adsec/attest',
    name: 'On-Chain Attestation',
    price: '$0.01 USDC',
    cardBadge: 'Card 3',
    desc: 'Hashes code with SHA-256 and writes a cryptographic proof-of-audit certificate on Algorand TestNet.',
  },
  audit: {
    path: '/adsec/audit',
    name: 'Unified Audit Suite',
    price: '$0.05 USDC',
    cardBadge: 'Full Pipeline',
    desc: 'Complete all-in-one suite: Full Scan, Git Diff fixes, and On-Chain Attestation.',
  },
}

export const AdsecPlayground: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet()
  const [mode, setMode] = useState<EndpointMode>('audit')
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id)
  const [code, setCode] = useState(PRESETS[0].code)
  const [filename, setFilename] = useState(PRESETS[0].filename)
  const [language, setLanguage] = useState<'python' | 'javascript' | 'typescript' | 'solidity'>('python')
  
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [auditResponse, setAuditResponse] = useState<AdsecResponse | null>(null)
  const [copiedDiffIdx, setCopiedDiffIdx] = useState<number | null>(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021'

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setSelectedPreset(preset.id)
      setCode(preset.code)
      setFilename(preset.filename)
      setLanguage(preset.language as any)
      setAuditResponse(null)
      setError('')
    }
  }

  const handleExecuteAudit = async () => {
    if (!activeAddress) {
      setError('Please connect your Algorand TestNet wallet (Pera / Defly) using the header button.')
      return
    }

    if (!signTransactions) {
      setError('Connected wallet does not support transaction signing.')
      return
    }

    setLoading(true)
    setError('')
    setPaymentStep('1. Sending request ➔ Awaiting HTTP 402 Challenge...')
    setAuditResponse(null)

    const endpointUrl = `${apiBaseUrl}${ENDPOINTS_META[mode].path}`

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
            setPaymentStep('1. Received HTTP 402 Payment Required ($0.01–$0.05 USDC)')
          } else if (step === 'signing') {
            setPaymentStep('2. Please approve & sign the transaction in your wallet...')
          } else if (step === 'settling') {
            setPaymentStep('3. Verifying on Algorand TestNet via GoPlausible Facilitator...')
          } else if (step === 'done') {
            setPaymentStep('✓ 200 OK — Payment Settled! Security Audit Report Delivered.')
          }
        }
      )

      setAuditResponse(response)
    } catch (err: any) {
      console.error('ADSEC execution error:', err)
      setError(err?.message || 'Failed to execute security audit request.')
      setPaymentStep('')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyDiff = (diffText: string, idx: number) => {
    navigator.clipboard.writeText(diffText)
    setCopiedDiffIdx(idx)
    setTimeout(() => setCopiedDiffIdx(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/40">
                x402 Protocol • Algorand TestNet
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40">
                GoPlausible Verified
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              ADSEC Security Node
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              On-demand, pay-per-call pre-flight security auditor for autonomous AI agents. Powered by micro-payments in TestNet USDC (ASA 10458941).
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-right">
            <div className="text-xs text-slate-400 font-mono">Receiver Address</div>
            <div className="text-xs text-indigo-300 font-mono font-bold">
              {activeAddress ? `${activeAddress.slice(0, 10)}...${activeAddress.slice(-8)}` : 'Connect Wallet'}
            </div>
          </div>
        </div>

        {/* 3-Endpoint Green Card Selector */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(['scan', 'remediate', 'attest', 'audit'] as EndpointMode[]).map((epKey) => {
            const meta = ENDPOINTS_META[epKey]
            const isSelected = mode === epKey
            return (
              <button
                key={epKey}
                onClick={() => setMode(epKey)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold font-mono text-emerald-400">{meta.cardBadge}</span>
                  <span className="text-xs font-mono font-black text-amber-300">{meta.price}</span>
                </div>
                <div className="font-semibold text-sm text-white">{meta.name}</div>
                <div className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-tight">{meta.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preset Selector & Code Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                Vulnerability Presets (Click to Load):
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      selectedPreset === p.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Box */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  <span className="ml-2 text-slate-300 font-bold">{filename}</span>
                </span>
                <span className="uppercase text-indigo-400">{language}</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 p-4 font-mono text-sm text-emerald-300 focus:outline-none resize-y leading-relaxed"
                placeholder="Paste code to audit..."
              />
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-500 font-mono">
                Calling: <span className="font-bold text-slate-700 dark:text-slate-300">{ENDPOINTS_META[mode].path}</span> • Fee: <span className="text-amber-600 dark:text-amber-400 font-bold">{ENDPOINTS_META[mode].price}</span>
              </div>

              <button
                onClick={handleExecuteAudit}
                disabled={loading || !activeAddress}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-slate-500 cursor-not-allowed'
                    : !activeAddress
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Processing x402 Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Run Paid Security Audit</span>
                    <span className="text-xs bg-indigo-800 px-2 py-0.5 rounded-md font-mono">
                      {ENDPOINTS_META[mode].price}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Payment Flow Status */}
      {paymentStep && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 shadow-lg text-white animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <div className="font-mono text-sm text-indigo-300 font-semibold">{paymentStep}</div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-950/80 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm flex items-center gap-2">
          <span className="font-bold text-red-400">[ERROR]</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {auditResponse && (
        <div className="space-y-6">
          {/* Score Header Card */}
          {auditResponse.summary && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border ${
                    auditResponse.summary.score >= 80
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                      : auditResponse.summary.score >= 50
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                      : 'bg-red-950/80 text-red-300 border-red-500'
                  }`}
                >
                  <span>{auditResponse.summary.score}</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">Score</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Security Health Score</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Duration: {auditResponse.summary.durationMs}ms • Endpoint: {auditResponse.endpoint || mode}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-4 gap-3 text-center w-full md:w-auto">
                <div className="bg-red-950/60 border border-red-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-red-400">{auditResponse.summary.critical}</div>
                  <div className="text-[10px] uppercase font-bold text-red-300">Critical</div>
                </div>
                <div className="bg-amber-950/60 border border-amber-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-amber-400">{auditResponse.summary.high}</div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">High</div>
                </div>
                <div className="bg-yellow-950/60 border border-yellow-500/30 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-yellow-400">{auditResponse.summary.medium}</div>
                  <div className="text-[10px] uppercase font-bold text-yellow-300">Medium</div>
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-2.5 px-4">
                  <div className="text-xl font-black text-slate-300">{auditResponse.summary.low}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Low</div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Attestation Badge */}
          {auditResponse.attestation && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                  Cryptographic On-Chain Attestation
                </h4>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-3 py-1 rounded-full border border-emerald-500/40">
                  {auditResponse.attestation.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div><span className="text-slate-500">Code SHA-256:</span> {auditResponse.attestation.codeHash}</div>
                <div><span className="text-slate-500">Tx Note Schema:</span> {auditResponse.attestation.txNoteSchema}</div>
                <div><span className="text-slate-500">Authority:</span> {auditResponse.attestation.attestationAuthority}</div>
              </div>
            </div>
          )}

          {/* Detailed Findings List */}
          {auditResponse.findings && auditResponse.findings.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Detailed Security Findings ({auditResponse.findings.length})
              </h3>
              <div className="space-y-3">
                {auditResponse.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            finding.severity === 'critical'
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                              : finding.severity === 'high'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{finding.title}</span>
                      </div>
                      {finding.cweId && (
                        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                          {finding.cweId}
                        </span>
                      )}
                    </div>

                    {finding.line && (
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        Line {finding.line}: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{finding.snippet}</code>
                      </div>
                    )}

                    {finding.remediation && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Remediation: </span>
                        {finding.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Unified Git Diff Fixes */}
          {auditResponse.fixes && auditResponse.fixes.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Autonomous Git Diff Patches ({auditResponse.fixes.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">git apply compatible</span>
              </div>

              <div className="space-y-4">
                {auditResponse.fixes.map((fix, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800">
                      <span>Fix for: {fix.findingId || `Issue #${idx + 1}`}</span>
                      <button
                        onClick={() => handleCopyDiff(fix.diff, idx)}
                        className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1 rounded transition-all text-[11px]"
                      >
                        {copiedDiffIdx === idx ? 'Copied' : 'Copy Patch'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{fix.diff}</code>
                    </pre>
                    {fix.explanation && (
                      <div className="bg-slate-900/60 p-3 border-t border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Explanation: </span>
                        {fix.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Chain Receipt */}
          {auditResponse.receipt && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span>Network: </span>
                <span className="text-slate-200">{auditResponse.receipt.network || 'Algorand TestNet'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Settled via GoPlausible • </span>
                <a
                  href="https://lora.algokit.io/testnet"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                >
                  Verify on Lora Explorer ↗
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
