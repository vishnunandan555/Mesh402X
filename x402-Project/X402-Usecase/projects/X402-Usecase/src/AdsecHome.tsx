import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import ConnectWallet from './components/ConnectWallet'
import AdsecPlayground from './components/AdsecPlayground'
import OnChainLedger from './components/OnChainLedger'

export const AdsecHome: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'playground' | 'ledger'>('playground')
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-indigo-500/30">
              SEC
            </div>
            <div>
              <div className="font-black text-base text-white tracking-wide flex items-center gap-2">
                ADSEC <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono font-bold">ALGORAND x402</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Autonomous Pre-Flight Security Node</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-mono font-bold">
              <button
                onClick={() => setCurrentView('playground')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentView === 'playground'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auditor
              </button>
              <button
                onClick={() => setCurrentView('ledger')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentView === 'ledger'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📜 On-Chain Ledger
              </button>
            </div>

            <button
              onClick={toggleWalletModal}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-2 ${
                activeAddress
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeAddress ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></span>
              {activeAddress ? `${activeAddress.slice(0, 8)}...${activeAddress.slice(-6)}` : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-6">
        {currentView === 'playground' ? <AdsecPlayground /> : <OnChainLedger />}
      </main>

      {/* Wallet Modal */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}

export default AdsecHome
