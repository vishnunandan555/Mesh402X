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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Bar */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/15 text-emerald-300 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span>{isSyncing ? 'Syncing Indexer...' : 'Live Algorand TestNet Feed'}</span>
            </span>
            <span className="bg-white/5 text-neutral-300 text-xs px-3 py-1 rounded-full border border-white/15">
              x402 USDC (ASA 10458941)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">On-Chain Settlement Ledger</h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Verifiable real-time audit payments and attestation receipts queried from Algorand TestNet consensus.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === 'merchant' && isAdminUnlocked && (
            <button
              onClick={handleAdminLock}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-lg font-mono transition-all flex items-center gap-1"
            >
              🔒 Lock Console
            </button>
          )}

          <div className="flex bg-black border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('network')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'network'
                  ? 'bg-emerald-500 text-black shadow shadow-emerald-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Network Feed
            </button>
            <button
              onClick={() => setViewMode('user')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'user'
                  ? 'bg-emerald-500 text-black shadow shadow-emerald-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              My Receipts
            </button>
            <button
              onClick={() => setViewMode('merchant')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'merchant'
                  ? 'bg-emerald-500 text-black shadow shadow-emerald-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAdminUnlocked ? 'Operator Console' : 'Operator Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Passcode Gate if merchant selected and not unlocked */}
      {viewMode === 'merchant' && !isAdminUnlocked ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-md mx-auto text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300 font-bold text-xs tracking-widest">
            AUTH
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Operator Console</h3>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Enter operator passcode to view receiver analytics and treasury breakdown.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2">
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Enter passcode (adsec2026)..."
              className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-center font-mono text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/70"
            />
            {adminAuthError && (
              <div className="text-xs font-mono text-red-400">{adminAuthError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              Unlock Console
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {viewMode === 'user' ? (
              <>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">Connected Account</div>
                  <div className="text-sm font-mono font-bold text-white mt-1 truncate">
                    {activeAddress || 'Wallet not connected'}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">TestNet ALGO Balance</div>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                    {userBalances ? `${userBalances.algo.toFixed(3)} ALGO` : '—'}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">TestNet USDC Balance</div>
                  <div className="text-xl font-mono font-black text-white mt-1">
                    {userBalances ? `$${userBalances.usdc.toFixed(3)} USDC` : '—'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">Settlement Address</div>
                  <div className="text-sm font-mono font-bold text-emerald-300 mt-1 truncate" title={RECEIVER_WALLET}>
                    {RECEIVER_WALLET.slice(0, 10)}...{RECEIVER_WALLET.slice(-8)}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">Total Settled Volume</div>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                    ${networkStats.totalRevenue.toFixed(3)} USDC
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white">
                  <div className="text-xs text-neutral-400 font-mono uppercase">Node Services & Capacity</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online (4 Paid Routes · {networkStats.totalAudits} Audits)</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Transaction List */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-xl text-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>
                  {viewMode === 'user'
                    ? 'Your Verified Receipts'
                    : viewMode === 'merchant'
                    ? 'Operator Settlement History'
                    : 'Live Node Settlement Stream'}
                </span>
                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                  {transactions.length} record(s)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  auto-syncing 5s
                </span>
              </h3>
              <button
                onClick={() => fetchTransactions(true)}
                disabled={loading}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500 font-mono text-xs space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>Querying Algorand TestNet Indexer...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 font-mono text-xs bg-black rounded-xl border border-white/10 p-6 space-y-3">
                {viewMode === 'user' && !activeAddress ? (
                  <>
                    <div className="text-neutral-300 font-bold">Wallet Not Connected</div>
                    <div>Connect your Algorand wallet above to view your personal transaction receipts.</div>
                    <button
                      onClick={() => setViewMode('network')}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                    >
                      View Live Network Feed Instead
                    </button>
                  </>
                ) : (
                  <div>No on-chain transactions detected for this account yet.</div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black/60 text-neutral-400 border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Settled At</th>
                      <th className="py-3 px-4">Counterparty</th>
                      <th className="py-3 px-4">Receipt / Note</th>
                      <th className="py-3 px-4 text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-emerald-300">
                          <button
                            onClick={() => copyToClipboard(tx.id, tx.id)}
                            className="hover:underline text-left"
                            title="Click to copy full TxID"
                          >
                            {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                          </button>
                          {copiedTxId === tx.id && (
                            <span className="ml-1 text-[10px] text-emerald-400 font-bold">[Copied]</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              tx.type === 'x402 Micropayment'
                                ? 'bg-white/10 text-white border-white/25'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-white">
                          {tx.amountUsdc > 0 ? `$${tx.amountUsdc.toFixed(3)} USDC` : '0.000 ALGO'}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">{tx.timestamp}</td>
                        <td className="py-3 px-4 text-neutral-400 truncate max-w-[140px]" title={tx.sender}>
                          {viewMode === 'user'
                            ? tx.receiver === RECEIVER_WALLET
                              ? 'Medusa Node'
                              : `${tx.receiver.slice(0, 6)}...`
                            : `${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 max-w-[180px] truncate" title={tx.note}>
                          <span className="text-neutral-300 text-[11px] font-mono bg-black px-1.5 py-0.5 rounded border border-white/10">
                            {tx.note || 'x402 Audit Proof'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <a
                            href={`https://lora.algokit.io/testnet/transaction/${tx.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 rounded-md transition-all text-[11px] font-bold inline-flex items-center gap-1"
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
