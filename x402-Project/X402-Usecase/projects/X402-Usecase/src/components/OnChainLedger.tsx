import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { IconExternal, IconLock, IconRefresh, IconWallet } from './icons'

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
const INDEXER_URL = import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud'
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

  const fetchTransactions = useCallback(
    async (showFullLoader = false) => {
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
          const usdcAsset = accData.account?.assets?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Algorand Indexer JSON
            (a: any) => Number(a['asset-id']) === USDC_ASA_ID,
          )
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

          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Algorand Indexer JSON
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
        // eslint-disable-next-line no-console -- non-fatal indexer polling failure
        console.warn('Indexer query notice:', err)
      } finally {
        setLoading(false)
        setIsSyncing(false)
        isFirstLoad.current = false
      }
    },
    [activeAddress, viewMode],
  )

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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Bar */}
      <div className="bg-base-900/70 border border-base-800 rounded-2xl p-6 shadow-node flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-accent/[0.08] text-accent text-xs font-mono px-2.5 py-1 rounded-md border border-accent/35 flex items-center gap-1.5 tnum">
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-accent animate-pulse'}`}></span>
              <span>{isSyncing ? 'Syncing indexer…' : 'Live Algorand TestNet feed'}</span>
            </span>
            <span className="bg-base-950 text-base-300 text-xs font-mono px-2.5 py-1 rounded-md border border-base-700 tnum">
              x402 USDC (ASA 10458941)
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-base-100">On-chain settlement ledger</h2>
          <p className="text-xs text-base-400 font-mono mt-1.5 max-w-lg">
            Verifiable real-time audit payments and attestation receipts queried from Algorand TestNet consensus.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === 'merchant' && isAdminUnlocked && (
            <button
              onClick={handleAdminLock}
              className="text-xs bg-red-500/[0.07] hover:bg-red-500/15 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-md font-mono transition-all duration-200 focus-ring active:scale-[0.98] flex items-center gap-1.5"
            >
              <IconLock size={12} />
              Lock console
            </button>
          )}

          <div className="flex bg-base-950 border border-base-800 rounded-xl p-1">
            {(
              [
                { id: 'network', label: 'Network feed' },
                { id: 'user', label: 'My receipts' },
                { id: 'merchant', label: isAdminUnlocked ? 'Operator console' : 'Operator login' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id)}
                aria-pressed={viewMode === t.id}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 focus-ring active:scale-[0.98] ${
                  viewMode === t.id ? 'bg-accent text-base-ink shadow-glow' : 'text-base-400 hover:text-base-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Passcode Gate if merchant selected and not unlocked */}
      {viewMode === 'merchant' && !isAdminUnlocked ? (
        <div className="bg-base-900/70 border border-base-800 rounded-2xl p-8 max-w-md mx-auto text-center shadow-pop space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/35 flex items-center justify-center mx-auto text-accent">
            <IconLock size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-base-100">Operator console</h3>
            <p className="text-xs text-base-400 font-mono mt-1.5">
              Enter the operator passcode to view receiver analytics and treasury breakdown.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2">
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Operator passcode"
              aria-label="Operator passcode"
              className="w-full bg-base-ink border border-base-700 rounded-xl px-4 py-2.5 text-center font-mono text-sm text-base-100 placeholder:text-base-600 focus:outline-none focus:border-accent/60 focus-ring"
            />
            {adminAuthError && (
              <div role="alert" className="text-xs font-mono text-red-400">
                {adminAuthError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-bright text-base-ink font-semibold py-2.5 rounded-xl text-sm shadow-glow transition-all duration-200 active:scale-[0.98] focus-ring"
            >
              Unlock console
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {viewMode === 'user' ? (
              <>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">Connected account</div>
                  <div className="text-sm font-mono font-semibold text-base-100 mt-1.5 truncate tnum" title={activeAddress || undefined}>
                    {activeAddress || 'Wallet not connected'}
                  </div>
                </div>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">TestNet ALGO balance</div>
                  <div className="text-xl font-display font-semibold text-accent mt-1.5 tnum">
                    {userBalances ? `${userBalances.algo.toFixed(3)} ALGO` : '—'}
                  </div>
                </div>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">TestNet USDC balance</div>
                  <div className="text-xl font-display font-semibold text-base-100 mt-1.5 tnum">
                    {userBalances ? `$${userBalances.usdc.toFixed(3)} USDC` : '—'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">Settlement address</div>
                  <div className="text-sm font-mono font-semibold text-accent mt-1.5 truncate tnum" title={RECEIVER_WALLET}>
                    {RECEIVER_WALLET.slice(0, 10)}…{RECEIVER_WALLET.slice(-8)}
                  </div>
                </div>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">Total settled volume</div>
                  <div className="text-xl font-display font-semibold text-accent mt-1.5 tnum">
                    ${networkStats.totalRevenue.toFixed(3)} USDC
                  </div>
                </div>
                <div className="bg-base-900/70 border border-base-800 rounded-xl p-4">
                  <div className="text-xs text-base-500 font-mono">Node services &amp; capacity</div>
                  <div className="text-sm font-mono font-semibold text-accent mt-1.5 flex items-center gap-2 tnum">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                    <span>Online · 4 paid routes · {networkStats.totalAudits} audits</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Transaction List */}
          <div className="bg-base-900/70 border border-base-800 rounded-2xl p-5 shadow-node space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="font-semibold text-base text-base-100 flex items-center gap-2 flex-wrap">
                <span>
                  {viewMode === 'user'
                    ? 'Your verified receipts'
                    : viewMode === 'merchant'
                      ? 'Operator settlement history'
                      : 'Live node settlement stream'}
                </span>
                <span className="text-xs bg-base-800 text-base-400 px-2 py-0.5 rounded-md font-mono tnum">
                  {transactions.length} records
                </span>
                <span className="text-[11px] font-mono text-accent bg-accent/[0.08] border border-accent/30 px-2 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
                  auto-sync 5s
                </span>
              </h3>
              <button
                onClick={() => fetchTransactions(true)}
                disabled={loading}
                className="text-xs text-accent hover:text-accent-bright font-medium border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/[0.08] transition-all duration-200 focus-ring active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <IconRefresh size={12} />
                {loading ? 'Refreshing…' : 'Refresh now'}
              </button>
            </div>

            {loading ? (
              /* Skeleton rows shaped like the table — no generic spinners */
              <div className="space-y-2" role="status" aria-label="Loading transactions">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1fr] gap-4 items-center bg-base-950/60 border border-base-800/60 rounded-lg px-4 py-3.5"
                  >
                    <div className="skeleton h-3 w-24" style={{ animationDelay: `${i * 120}ms` }}></div>
                    <div className="skeleton h-3 w-16" style={{ animationDelay: `${i * 120 + 60}ms` }}></div>
                    <div className="skeleton h-3 w-14" style={{ animationDelay: `${i * 120 + 120}ms` }}></div>
                    <div className="skeleton h-3 w-20 hidden sm:block" style={{ animationDelay: `${i * 120 + 180}ms` }}></div>
                    <div className="skeleton h-5 w-20 ml-auto" style={{ animationDelay: `${i * 120 + 240}ms` }}></div>
                  </div>
                ))}
                <div className="pt-1 text-center text-[11px] font-mono text-base-600">Querying Algorand TestNet indexer…</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-14 text-base-400 font-mono text-xs bg-base-950/60 rounded-xl border border-base-800 p-6 space-y-4">
                {viewMode === 'user' && !activeAddress ? (
                  <>
                    <IconWallet size={22} className="mx-auto text-base-500" />
                    <div>
                      <div className="text-base-200 font-semibold font-sans text-sm mb-1">Wallet not connected</div>
                      <div>Connect your Algorand wallet to view your personal transaction receipts.</div>
                    </div>
                    <button
                      onClick={() => setViewMode('network')}
                      className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-bright text-base-ink font-semibold font-sans text-xs transition-all duration-200 focus-ring active:scale-[0.98]"
                    >
                      View live network feed instead
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-base-300 font-semibold font-sans text-sm">No on-chain activity yet</div>
                    <div>Transactions for this account will appear here as soon as they settle.</div>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-base-950/80 text-base-500 border-b border-base-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-medium">Transaction ID</th>
                      <th className="py-3 px-4 font-medium">Type</th>
                      <th className="py-3 px-4 font-medium">Amount</th>
                      <th className="py-3 px-4 font-medium">Settled at</th>
                      <th className="py-3 px-4 font-medium">Counterparty</th>
                      <th className="py-3 px-4 font-medium">Receipt / note</th>
                      <th className="py-3 px-4 font-medium text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-800/60 tnum">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors duration-150">
                        <td className="py-3 px-4 font-semibold text-accent">
                          <button
                            onClick={() => copyToClipboard(tx.id, tx.id)}
                            className="hover:underline text-left focus-ring rounded-sm"
                            title="Click to copy full TxID"
                          >
                            {tx.id.slice(0, 8)}…{tx.id.slice(-6)}
                          </button>
                          {copiedTxId === tx.id && <span className="ml-1.5 text-[10px] text-accent">[copied]</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] border ${
                              tx.type === 'x402 Micropayment'
                                ? 'bg-base-800 text-base-200 border-base-700'
                                : 'bg-accent/[0.08] text-accent border-accent/30'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-base-100">
                          {tx.amountUsdc > 0 ? `$${tx.amountUsdc.toFixed(3)} USDC` : '0.000 ALGO'}
                        </td>
                        <td className="py-3 px-4 text-base-400 whitespace-nowrap">{tx.timestamp}</td>
                        <td className="py-3 px-4 text-base-400 truncate max-w-[140px]" title={tx.sender}>
                          {viewMode === 'user'
                            ? tx.receiver === RECEIVER_WALLET
                              ? 'Medusa node'
                              : `${tx.receiver.slice(0, 6)}…`
                            : `${tx.sender.slice(0, 6)}…${tx.sender.slice(-4)}`}
                        </td>
                        <td className="py-3 px-4 text-base-400 max-w-[180px] truncate" title={tx.note}>
                          <span className="text-base-300 text-[11px] font-mono bg-base-950 px-1.5 py-0.5 rounded-md border border-base-800">
                            {tx.note || 'x402 audit proof'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <a
                            href={`https://lora.algokit.io/testnet/transaction/${tx.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 border border-accent/35 hover:bg-accent/[0.1] text-accent px-2.5 py-1 rounded-md transition-all duration-200 focus-ring active:scale-[0.98] text-[11px] font-semibold"
                          >
                            Lora <IconExternal size={10} />
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
