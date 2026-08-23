import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Weather from './components/Weather'

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen grid-bg py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-teal-500/40 bg-teal-500/10 text-teal-300">
              METERED TELEMETRY
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
              $0.005 USDC / REQUEST
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Live Data Feed
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Demonstrating pay-as-you-go microservices on Algorand. Query real-time weather telemetry with instant on-chain settlement.
          </p>
        </div>

        {/* Disconnected state prompt */}
        {!activeAddress && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 text-center shadow-xl space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center mx-auto text-xl">
              🌤️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Wallet to Query Data</h2>
              <p className="text-xs text-slate-400 mt-1">
                Each API query settles $0.005 TestNet USDC directly via the x402 protocol.
              </p>
            </div>
            <button
              className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              onClick={toggleWalletModal}
              data-test-id="connect-wallet"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Live Weather Component */}
        {activeAddress && (
          <div className="animate-fade-in">
            <Weather />
          </div>
        )}

        {/* Protocol Spec Highlights */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
            How Metered Endpoints Function
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When your client calls <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">GET /weather</code>, the server responds with <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">402 Payment Required</code> specifying the price and facilitator. Once your wallet signs the 0.005 USDC transaction, the payload is unlocked and returned immediately.
          </p>
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default Home
