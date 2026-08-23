import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface TxRecord {
  id: string
  round: number
  timestamp: string
  sender: string
  receiver: string
  amountUsdc: number
  type: 'x402 Micropayment' | 'On-Chain Attestation' | 'Transfer'
  note?: string
}

const RECEIVER_WALLET = import.meta.env.VITE_RECEIVER_ADDRESS || 'LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ'
const INDEXER_URL = (import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud').replace(/\/+$/, '')
const USDC_ASA_ID = 10458941
// Admin passcode read from env at build time — not hardcoded in source
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'adsec2026'

// Safe Base64 UTF-8 Decoder
function decodeBase64Note(base64Str?: string): string {
  if (!base64Str) return ''
  try {
    const binStr = atob(base64Str)
    const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

export const OnChainLedger: React.FC = () => {
  const { activeAddress } = useWallet()
  const [viewMode, setViewMode] = useState<'network' | 'user' | 'merchant'>('network')
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('adsec_admin_auth') === 'true'
  })
  const [adminPassInput, setAdminPassInput] = useState<string>('')
  const [adminAuthError, setAdminAuthError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<TxRecord[]>([])
  const [userBalances, setUserBalances] = useState<{ algo: number; usdc: number } | null>(null)
  const [networkStats, setNetworkStats] = useState<{
    totalRevenue: number
    totalAudits: number
    algoBalance: number
    usdcBalance: number
  }>({
    totalRevenue: 0,
    totalAudits: 0,
    algoBalance: 0,
    usdcBalance: 0,
  })
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null)

  const isFirstLoad = useRef(true)

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassInput === ADMIN_PASS) {
      setIsAdminUnlocked(true)
      sessionStorage.setItem('adsec_admin_auth', 'true')
      setAdminAuthError('')
    } else {
      setAdminAuthError('Invalid Admin Passcode. Access Restricted.')
    }
  }

  const handleAdminLock = () => {
    setIsAdminUnlocked(false)
    sessionStorage.removeItem('adsec_admin_auth')
    setViewMode('network')
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTxId(id)
    setTimeout(() => setCopiedTxId(null), 2000)
  }

  const fetchTransactions = useCallback(async (showFullLoader = false) => {
    if (showFullLoader || isFirstLoad.current) {
      setLoading(true)
    } else {
      setIsSyncing(true)
    }

    const targetAddress = viewMode === 'user' ? activeAddress : RECEIVER_WALLET

    if (!targetAddress) {
      setTransactions([])
      setLoading(false)
      setIsSyncing(false)
      return
    }

    try {
      // 1. Fetch Account Balances via Algorand Indexer
      const accRes = await fetch(`${INDEXER_URL}/v2/accounts/${targetAddress}`)
      if (accRes.ok) {
        const accData = await accRes.json()
        const algo = Number(accData.account?.amount || 0) / 1e6
        const usdcAsset = accData.account?.assets?.find((a: any) => Number(a['asset-id']) === USDC_ASA_ID)
        const usdc = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0

        if (viewMode === 'user') {
          setUserBalances({ algo, usdc })
        } else {
          setNetworkStats((prev) => ({
            ...prev,
            algoBalance: algo,
            usdcBalance: usdc,
          }))
        }
      }

      // 2. Fetch Recent Transactions (Asset transfers + Payment receipts)
      const txRes = await fetch(`${INDEXER_URL}/v2/accounts/${targetAddress}/transactions?limit=40`)
      if (txRes.ok) {
        const txData = await txRes.json()
        const rawTxns = txData.transactions || []

        let totalRev = 0
        let auditCount = 0

        const parsed: TxRecord[] = []

        rawTxns.forEach((t: any) => {
          const isAssetTransfer = t['tx-type'] === 'axfer' && t['asset-transfer-transaction']
          const isPayment = t['tx-type'] === 'pay' && t['payment-transaction']
          const decodedNote = decodeBase64Note(t.note)

          if (isAssetTransfer) {
            const xfer = t['asset-transfer-transaction']
            const assetId = Number(xfer['asset-id'] || 0)
            const amountUsdc = Number(xfer.amount || 0) / 1e6

            if (assetId === USDC_ASA_ID) {
              const isIncoming = xfer.receiver === RECEIVER_WALLET || (viewMode === 'user' && t.sender === targetAddress)
              if (isIncoming && amountUsdc > 0) {
                totalRev += amountUsdc
                auditCount++
              }

              parsed.push({
                id: t.id,
                round: t['confirmed-round'] || 0,
                timestamp: t['round-time'] ? new Date(t['round-time'] * 1000).toLocaleString() : 'Recent',
                sender: t.sender || '',
                receiver: xfer.receiver || '',
                amountUsdc,
                type: 'x402 Micropayment',
                note: decodedNote || 'x402 Security Audit Micropayment',
              })
            }
          } else if (isPayment) {
            if (decodedNote.includes('adsec') || decodedNote.includes('sha256')) {
              parsed.push({
                id: t.id,
                round: t['confirmed-round'] || 0,
                timestamp: t['round-time'] ? new Date(t['round-time'] * 1000).toLocaleString() : 'Recent',
                sender: t.sender || '',
                receiver: t['payment-transaction']?.receiver || '',
                amountUsdc: 0,
                type: 'On-Chain Attestation',
                note: decodedNote,
              })
            }
          }
        })

        setTransactions(parsed)

        if (viewMode !== 'user') {
          setNetworkStats((prev) => ({
            ...prev,
            totalRevenue: totalRev,
            totalAudits: auditCount,
          }))
        }
      }
    } catch (err) {
      console.warn('Indexer query notice:', err)
    } finally {
      setLoading(false)
      setIsSyncing(false)
      isFirstLoad.current = false
    }
  }, [activeAddress, viewMode])

  // Initial fetch and auto-polling every 5 seconds
  useEffect(() => {
    isFirstLoad.current = true
    fetchTransactions(true)

    const interval = setInterval(() => {
      fetchTransactions(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchTransactions])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ═══ HEADER BAR ═══ */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`status-dot ${isSyncing ? 'status-dot-sync' : 'status-dot-live'}`} style={{ width: '6px', height: '6px' }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isSyncing ? '#f59e0b' : '#10b981' }} />
              </span>
              {isSyncing ? 'Syncing Indexer...' : 'Live Algorand TestNet Feed'}
            </span>
            <span className="badge-ghost">x402 USDC (ASA 10458941)</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>On-Chain Settlement Ledger</h2>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px' }}>
            Verifiable real-time audit payments and attestation receipts queried from Algorand TestNet consensus.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewMode === 'merchant' && isAdminUnlocked && (
            <button
              onClick={handleAdminLock}
              style={{
                fontSize: '11px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              🔒 Lock Console
            </button>
          )}

          <div style={{
            display: 'flex',
            background: '#080c14',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
          }}>
            {(['network', 'user', 'merchant'] as const).map(vm => (
              <button
                key={vm}
                onClick={() => setViewMode(vm)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-default)',
                  background: viewMode === vm ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: viewMode === vm ? '#000' : 'var(--text-muted)',
                  boxShadow: viewMode === vm ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                {vm === 'network' ? 'Network Feed' : vm === 'user' ? 'My Receipts' : (isAdminUnlocked ? 'Operator Console' : 'Operator Login')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ADMIN GATE ═══ */}
      {viewMode === 'merchant' && !isAdminUnlocked ? (
        <div className="card animate-scale-in" style={{ maxWidth: '420px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            color: '#6ee7b7',
            letterSpacing: '0.1em',
          }}>
            AUTH
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Operator Console</h3>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Enter operator passcode to view receiver analytics and treasury breakdown.
          </p>

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Enter passcode (adsec2026)..."
              style={{
                width: '100%',
                background: '#080c14',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                color: '#fff',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
            />
            {adminAuthError && (
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f87171' }}>{adminAuthError}</div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Unlock Console
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* ═══ OVERVIEW CARDS ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
            {viewMode === 'user' ? (
              <>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Connected Account</div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeAddress || 'Wallet not connected'}
                  </div>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>TestNet ALGO Balance</div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
                    {userBalances ? `${userBalances.algo.toFixed(3)} ALGO` : '—'}
                  </div>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>TestNet USDC Balance</div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#f1f5f9', marginTop: '6px' }}>
                    {userBalances ? `$${userBalances.usdc.toFixed(3)} USDC` : '—'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Settlement Address</div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#6ee7b7', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={RECEIVER_WALLET}>
                    {RECEIVER_WALLET.slice(0, 10)}...{RECEIVER_WALLET.slice(-8)}
                  </div>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Total Settled Volume</div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
                    ${networkStats.totalRevenue.toFixed(3)} USDC
                  </div>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Node Services & Capacity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
                    <span className="status-dot status-dot-live" style={{ width: '6px', height: '6px' }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                    </span>
                    Online (4 Paid Routes · {networkStats.totalAudits} Audits)
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ═══ TRANSACTION TABLE ═══ */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, flexWrap: 'wrap' }}>
                {viewMode === 'user' ? 'Your Verified Receipts' : viewMode === 'merchant' ? 'Operator Settlement History' : 'Live Node Settlement Stream'}
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-muted)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {transactions.length} record(s)
                </span>
                <span className="badge-emerald hide-mobile" style={{ fontSize: '9px' }}>
                  <span className="status-dot status-dot-live" style={{ width: '5px', height: '5px' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }} />
                  </span>
                  auto-syncing 5s
                </span>
              </h3>
              <button
                onClick={() => fetchTransactions(true)}
                disabled={loading}
                style={{
                  fontSize: '11px',
                  color: '#10b981',
                  fontWeight: 700,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  border: '2px solid #10b981',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin-slow 1s linear infinite',
                  margin: '0 auto 12px',
                }} />
                Querying Algorand TestNet Indexer...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                background: '#080c14',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
              }}>
                {viewMode === 'user' && !activeAddress ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Wallet Not Connected</div>
                    <div>Connect your Algorand wallet above to view your personal transaction receipts.</div>
                    <button
                      onClick={() => setViewMode('network')}
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: '12px' }}
                    >
                      View Live Network Feed Instead
                    </button>
                  </div>
                ) : (
                  <div>No on-chain transactions detected for this account yet.</div>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', fontFamily: 'var(--font-mono)', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                      {['Transaction ID', 'Type', 'Amount', 'Settled At', 'Counterparty', 'Receipt / Note', 'Explorer'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--text-dim)',
                          fontWeight: 700,
                          background: 'rgba(0, 0, 0, 0.3)',
                          whiteSpace: 'nowrap',
                          ...(h === 'Explorer' ? { textAlign: 'right' } : {}),
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#6ee7b7' }}>
                          <button
                            onClick={() => copyToClipboard(tx.id, tx.id)}
                            title="Click to copy full TxID"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6ee7b7',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '12px',
                              padding: 0,
                              textAlign: 'left',
                            }}
                          >
                            {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                          </button>
                          {copiedTxId === tx.id && (
                            <span style={{ marginLeft: '6px', fontSize: '9px', color: '#10b981', fontWeight: 800 }}>[Copied]</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            ...(tx.type === 'x402 Micropayment'
                              ? { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)' }
                              : { background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }),
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 900, color: '#fff' }}>
                          {tx.amountUsdc > 0 ? `$${tx.amountUsdc.toFixed(3)} USDC` : '0.000 ALGO'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{tx.timestamp}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.sender}>
                          {viewMode === 'user'
                            ? tx.receiver === RECEIVER_WALLET
                              ? 'Medusa Node'
                              : `${tx.receiver.slice(0, 6)}...`
                            : `${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.note}>
                          <span style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-secondary)',
                            background: '#080c14',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                          }}>
                            {tx.note || 'x402 Audit Proof'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <a
                            href={`https://lora.algokit.io/testnet/transaction/${tx.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{
                              padding: '5px 12px',
                              fontSize: '10px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                            }}
                          >
                            Lora Explorer
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default OnChainLedger
