import React, { useEffect, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { executeAdsecRequestWithPayment, AdsecResponse } from '../utils/adsecApi'
import AsciiTerminal, { TerminalPhase } from './AsciiTerminal'
import { ENDPOINTS_META, ENDPOINT_ORDER, EndpointMode } from '../utils/adsecEndpoints'

const PRESETS = [
  {
    id: 'python-sqli-secret',
    name: 'Python: SQLi & Exposed Key',
    icon: '🐍',
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
    name: 'Supply Chain Attack',
    icon: '📦',
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
    name: 'Algorand: Unchecked ASA',
    icon: '⛓️',
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
    name: 'JavaScript: Eval & XSS',
    icon: '🌐',
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
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com').replace(/\/+$/, '')

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
      setLanguage(preset.language as 'python' | 'javascript' | 'typescript' | 'solidity')
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Audit request could not be completed.'
      console.error('ADSEC execution error:', err)
      setError(errorMessage)
      setTerminalPhase('error')
      setLoading(false)
      pushLog(`Error: ${errorMessage.slice(0, 52)}`)
    }
  }

  const handleCopyDiff = (diffText: string, idx: number) => {
    navigator.clipboard.writeText(diffText)
    setCopiedDiffIdx(idx)
    setTimeout(() => setCopiedDiffIdx(null), 2000)
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ═══ EDITOR CARD ═══ */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Preset Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>▸</span>
              Sample Vulnerability Presets:
            </label>

            {/* Endpoint Mode Selector */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
              gap: '2px',
            }}>
              {ENDPOINT_ORDER.map(ep => (
                <button
                  key={ep}
                  onClick={() => setMode(ep)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: mode === ep ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    color: mode === ep ? '#000' : 'var(--text-muted)',
                    boxShadow: mode === ep ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  {ENDPOINTS_META[ep].cardBadge}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: selectedPreset === p.id
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-default)',
                  background: selectedPreset === p.id
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'
                    : 'transparent',
                  color: selectedPreset === p.id ? '#6ee7b7' : 'var(--text-secondary)',
                  boxShadow: selectedPreset === p.id ? '0 0 12px rgba(16, 185, 129, 0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="terminal-chrome" style={{ borderRadius: 'var(--radius-lg)' }}>
          {/* Editor header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid var(--border-default)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filename}</span>
            </span>
            <span style={{
              textTransform: 'uppercase',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
            }}>{language}</span>
          </div>

          {/* Code textarea */}
          <div style={{ display: 'flex' }}>
            {/* Line numbers */}
            <div style={{
              padding: '16px 0',
              minWidth: '44px',
              textAlign: 'right',
              background: 'rgba(255, 255, 255, 0.015)',
              borderRight: '1px solid var(--border-subtle)',
              userSelect: 'none',
            }}>
              {code.split('\n').map((_, i) => (
                <div key={i} style={{
                  padding: '0 12px 0 0',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: '1.65',
                  color: 'var(--text-dim)',
                }}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.65',
                tabSize: 4,
              }}
              placeholder="Paste source code to audit..."
            />
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Service: <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{ENDPOINTS_META[mode].name}</span>
            {' '}({ENDPOINTS_META[mode].path}) · Cost:{' '}
            <span style={{ fontWeight: 800, color: '#fbbf24' }}>{ENDPOINTS_META[mode].price}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleExecuteAudit}
              disabled={loading || !activeAddress}
              className="btn-primary"
              style={{
                ...(loading ? { background: 'rgba(100, 116, 139, 0.3)', cursor: 'not-allowed', boxShadow: 'none' } : {}),
                ...(!activeAddress && !loading ? { background: 'rgba(100, 116, 139, 0.15)', cursor: 'not-allowed', boxShadow: 'none', color: 'var(--text-dim)' } : {}),
              }}
            >
              {loading ? (
                <>
                  <span className="animate-caret" style={{ fontFamily: 'var(--font-mono)' }}>█</span>
                  <span>Processing x402 Audit...</span>
                </>
              ) : (
                <>
                  <span>Run Paid Audit</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 800,
                  }}>
                    {ENDPOINTS_META[mode].price}
                  </span>
                </>
              )}
            </button>
            {!activeAddress && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Connect wallet to authorize $0.001 USDC
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TERMINAL ═══ */}
      {hasStarted && (
        <AsciiTerminal phase={terminalPhase} logs={terminalLogs} title={`Audit Telemetry — ${filename}`} />
      )}

      {/* ═══ ERROR ═══ */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#fca5a5',
        }}>
          <span style={{ fontWeight: 700, color: '#f87171' }}>Notice:</span>
          <span>{error}</span>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {auditResponse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Score Card */}
          {auditResponse.summary && (
            <div className="card animate-fade-in" style={{
              padding: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Score Ring */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${scoreColor(auditResponse.summary.score)}`,
                  background: `${scoreColor(auditResponse.summary.score)}15`,
                  boxShadow: `0 0 24px ${scoreColor(auditResponse.summary.score)}20`,
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: scoreColor(auditResponse.summary.score) }}>
                    {auditResponse.summary.score}
                  </span>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, color: scoreColor(auditResponse.summary.score) }}>/ 100</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Security Health Rating</h3>
                  <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Analyzed in {auditResponse.summary.durationMs}ms · {ENDPOINTS_META[mode].name}
                  </p>
                </div>
              </div>

              {/* Severity Counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Critical', count: auditResponse.summary.critical, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
                  { label: 'High', count: auditResponse.summary.high, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' },
                  { label: 'Medium', count: auditResponse.summary.medium, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.25)' },
                  { label: 'Low', count: auditResponse.summary.low, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.06)', border: 'rgba(148, 163, 184, 0.15)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    textAlign: 'center',
                    minWidth: '70px',
                  }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color }}>{s.count}</div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, color: s.color, opacity: 0.8, letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Chain Attestation Certificate */}
          {auditResponse.attestation && (
            <div className="animate-fade-in-delay-1" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(6, 182, 212, 0.04))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.08)',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#10b981', margin: 0, fontSize: '15px' }}>
                  <span className="status-dot status-dot-live" style={{ width: '8px', height: '8px' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                  </span>
                  On-Chain Audit Certificate
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-emerald" style={{ fontWeight: 800 }}>
                    {auditResponse.attestation.status === 'VERIFIED_ON_CHAIN' ? 'Confirmed on Algorand' : auditResponse.attestation.status}
                  </span>
                  {auditResponse.attestation.txId && (
                    <a
                      href={auditResponse.attestation.loraUrl || `https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '11px', borderRadius: 'var(--radius-full)' }}
                    >
                      View on Lora Explorer ↗
                    </a>
                  )}
                </div>
              </div>
              <div style={{
                background: '#080c14',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}>
                <div><span style={{ color: 'var(--text-dim)' }}>SHA-256 Code Hash:</span> <span style={{ color: '#6ee7b7' }}>{auditResponse.attestation.codeHash}</span></div>
                <div><span style={{ color: 'var(--text-dim)' }}>Note Format:</span> <span style={{ color: '#34d399' }}>{auditResponse.attestation.txNoteSchema}</span></div>
                {auditResponse.attestation.txId && (
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Transaction ID: </span>
                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${auditResponse.attestation.txId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {auditResponse.attestation.txId}
                    </a>
                  </div>
                )}
                <div><span style={{ color: 'var(--text-dim)' }}>Verification Authority:</span> {auditResponse.attestation.attestationAuthority}</div>
              </div>
            </div>
          )}

          {/* Findings */}
          {auditResponse.findings && auditResponse.findings.length > 0 && (
            <div className="card animate-fade-in-delay-2" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ color: '#f87171', fontFamily: 'var(--font-mono)' }}>●</span>
                Identified Issues ({auditResponse.findings.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditResponse.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      background: 'rgba(8, 12, 20, 0.6)',
                      borderLeft: `3px solid ${finding.severity === 'critical' ? '#ef4444' : finding.severity === 'high' ? '#f59e0b' : '#eab308'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.05em',
                          ...(finding.severity === 'critical' ? { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
                            : finding.severity === 'high' ? { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
                            : { background: 'rgba(234, 179, 8, 0.12)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' }),
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>{finding.title}</span>
                      </div>
                      {finding.cweId && (
                        <span style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-secondary)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                        }}>
                          {finding.cweId}
                        </span>
                      )}
                    </div>

                    {finding.line && (
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Line {finding.line}: <code style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#6ee7b7',
                        }}>{finding.snippet}</code>
                      </div>
                    )}

                    {finding.remediation && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Recommended Fix:</span>{' '}
                        {finding.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Git Diff Patches */}
          {auditResponse.fixes && auditResponse.fixes.length > 0 && (
            <div className="card animate-fade-in-delay-3" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>✓</span>
                  Ready-to-Apply Git Patches ({auditResponse.fixes.length})
                </h3>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Apply with `git apply`</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {auditResponse.fixes.map((fix, idx) => (
                  <div key={idx} className="terminal-chrome">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderBottom: '1px solid var(--border-default)',
                    }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        Patch {idx + 1} of {auditResponse.fixes?.length}
                      </span>
                      <button
                        onClick={() => handleCopyDiff(fix.diff, idx)}
                        style={{
                          background: copiedDiffIdx === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: '#6ee7b7',
                          padding: '5px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {copiedDiffIdx === idx ? 'Copied ✓' : 'Copy Patch'}
                      </button>
                    </div>
                    <pre style={{
                      padding: '16px 20px',
                      margin: 0,
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: '#6ee7b7',
                      overflowX: 'auto',
                      lineHeight: 1.7,
                    }}>
                      <code>{fix.diff}</code>
                    </pre>
                    {fix.explanation && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '12px 16px',
                        borderTop: '1px solid var(--border-default)',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>Why this fix works:</span> {fix.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* On-Chain Receipt */}
          {auditResponse.receipt && (
            <div className="card" style={{
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}>
              <div>
                Network: <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{auditResponse.receipt.network || 'Algorand TestNet'}</span>
                {auditResponse.receipt.paidAmount && (
                  <span className="badge-emerald" style={{ marginLeft: '8px', fontSize: '10px' }}>
                    Paid {auditResponse.receipt.paidAmount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Settled via GoPlausible ·
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
                  style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
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
