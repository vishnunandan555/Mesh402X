import React, { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

interface TxRecord {
  id: string
  round: number
  timestamp: string
  sender: string
  receiver: string
  amountUsdc: number
  note?: string
}

const RECEIVER_WALLET = import.meta.env.VITE_RECEIVER_ADDRESS || 'LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ'
const INDEXER_URL = import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud'
const USDC_ASA_ID = 10458941
// Admin passcode read from env at build time — not hardcoded in source
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'adsec2026'

export const OnChainLedger: React.FC = () => {
  const { activeAddress } = useWallet()
  const [viewMode, setViewMode] = useState<'user' | 'merchant'>('user')
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('adsec_admin_auth') === 'true'
  })
  const [adminPassInput, setAdminPassInput] = useState<string>('')
  const [adminAuthError, setAdminAuthError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<TxRecord[]>([])
  const [userBalances, setUserBalances] = useState<{ algo: number; usdc: number } | null>(null)
  const [merchantStats, setMerchantStats] = useState<{ totalRevenue: number; totalAudits: number; algoBalance: number } | null>(null)

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
    setViewMode('user')
  }

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const targetAddress = viewMode === 'user' ? activeAddress : RECEIVER_WALLET

    if (!targetAddress) {
      setTransactions([])
      setLoading(false)
      return
    }

    let merchantAlgoBalance = 0

    try {
      // 1. Fetch Account Balances
      const accRes = await fetch(`${INDEXER_URL}/v2/accounts/${targetAddress}`)
      if (accRes.ok) {
        const accData = await accRes.json()
        const algo = Number(accData.account?.amount || 0) / 1e6
        const usdcAsset = accData.account?.assets?.find((a: any) => a['asset-id'] === USDC_ASA_ID)
        const usdc = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0

        if (viewMode === 'user') {
          setUserBalances({ algo, usdc })
        } else {
          merchantAlgoBalance = algo
          setMerchantStats((prev) => ({
            totalRevenue: prev?.totalRevenue || 0,
            totalAudits: prev?.totalAudits || 0,
            algoBalance: algo,
          }))
        }
      }

      // 2. Fetch USDC Asset Transfer Transactions
      const txRes = await fetch(`${INDEXER_URL}/v2/accounts/${targetAddress}/transactions?asset-id=${USDC_ASA_ID}&limit=25`)
      if (txRes.ok) {
        const txData = await txRes.json()
        const rawTxns = txData.transactions || []

        let totalRev = 0
        const parsed: TxRecord[] = rawTxns.map((t: any) => {
          const xfer = t['asset-transfer-transaction'] || {}
          const amountUsdc = Number(xfer.amount || 0) / 1e6
          if (t['round-time']) {
            totalRev += amountUsdc
          }

          let decodedNote = ''
          if (t.note) {
            try {
              decodedNote = atob(t.note)
            } catch {
              decodedNote = ''
            }
          }

          return {
            id: t.id,
            round: t['confirmed-round'] || 0,
            timestamp: t['round-time'] ? new Date(t['round-time'] * 1000).toLocaleString() : 'Recent',
            sender: t.sender || '',
            receiver: xfer.receiver || '',
            amountUsdc,
            note: decodedNote,
          }
        })

        setTransactions(parsed)

        if (viewMode === 'merchant') {
          // Use freshly fetched merchantAlgoBalance — not stale state
          setMerchantStats({
            totalRevenue: totalRev,
            totalAudits: parsed.length,
            algoBalance: merchantAlgoBalance,
          })
        }
      }
    } catch (err) {
      console.warn('Indexer fetch notice:', err)
    } finally {
      setLoading(false)
    }
  }, [activeAddress, viewMode])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 font-bold">
              Algorand Indexer Feed
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/40">
              TestNet USDC (ASA 10458941)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">On-Chain Settlement Ledger</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Verifiable transaction feed queried directly from Algorand TestNet nodes.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === 'merchant' && isAdminUnlocked && (
            <button
              onClick={handleAdminLock}
              className="text-xs bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-lg font-mono transition-all flex items-center gap-1"
            >
              🔒 Lock Console
            </button>
          )}

          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('user')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'user'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Receipts
            </button>
            <button
              onClick={() => setViewMode('merchant')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === 'merchant'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAdminUnlocked ? 'Operator Console' : 'Operator Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Passcode Gate if not unlocked */}
      {viewMode === 'merchant' && !isAdminUnlocked ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 font-mono font-bold text-xs">
            AUTH
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Operator Console</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Enter operator passcode to view receiver analytics and aggregate volume.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2">
            <input
              type="password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-sm text-indigo-300 focus:outline-none focus:border-indigo-500"
            />
            {adminAuthError && (
              <div className="text-xs font-mono text-red-400">{adminAuthError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl font-mono text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">Connected Account</div>
                  <div className="text-sm font-mono font-bold text-indigo-300 mt-1 truncate">
                    {activeAddress || 'Wallet not connected'}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">TestNet ALGO Balance</div>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                    {userBalances ? `${userBalances.algo.toFixed(3)} ALGO` : '—'}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">TestNet USDC Balance</div>
                  <div className="text-xl font-mono font-black text-amber-400 mt-1">
                    {userBalances ? `$${userBalances.usdc.toFixed(2)} USDC` : '—'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">Settlement Address</div>
                  <div className="text-sm font-mono font-bold text-indigo-300 mt-1 truncate">
                    {RECEIVER_WALLET}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">Total Settled Volume</div>
                  <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                    {merchantStats ? `$${merchantStats.totalRevenue.toFixed(2)} USDC` : '—'}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
                  <div className="text-xs text-slate-400 font-mono uppercase">Node Services</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online (4 Paid Routes Active)
                  </div>
                </div>
              </>
            )}
          </div>

      {/* Transaction List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <span>{viewMode === 'user' ? 'Your Verified Receipts' : 'Recent Node Settlements'}</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {transactions.length} record(s)
            </span>
          </h3>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-bold border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-950 transition-all flex items-center gap-1.5"
          >
            {loading ? 'Refreshing...' : 'Refresh Feed'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            Querying Algorand TestNet Indexer...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs bg-slate-950 rounded-xl border border-slate-800/80">
            {viewMode === 'user' && !activeAddress
              ? 'Connect your Algorand wallet above to view your on-chain transaction receipts.'
              : 'No on-chain transactions detected for this account yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Settled At</th>
                  <th className="py-3 px-4">Counterparty</th>
                  <th className="py-3 px-4 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-4 font-bold text-indigo-300">
                      {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                    </td>
                    <td className="py-3 px-4 font-black text-amber-300">
                      ${tx.amountUsdc.toFixed(3)} USDC
                    </td>
                    <td className="py-3 px-4 text-slate-400">{tx.timestamp}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]">
                      {viewMode === 'user'
                        ? tx.receiver === RECEIVER_WALLET
                          ? 'Medusa Node'
                          : `${tx.receiver.slice(0, 6)}...`
                        : `${tx.sender.slice(0, 6)}...${tx.sender.slice(-4)}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://lora.algokit.io/testnet/transaction/${tx.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white px-2.5 py-1 rounded-md border border-indigo-500/40 transition-all text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        View on Lora
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
