import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import MemeGenerator from './components/MemeGenerator'

const MemeHome: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen grid-bg py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300">
              CREATIVE COMMERCE
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
              0.10 USDC / CALL
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Meme Studio
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Generate customized visuals and captions on demand with instant x402 micropayments.
          </p>
        </div>

        {/* Wallet Prompt if disconnected */}
        {!activeAddress && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 text-center shadow-xl space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-xl">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Your Wallet to Begin</h2>
              <p className="text-xs text-slate-400 mt-1">
                Connect an Algorand TestNet wallet with USDC to authorize generations.
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

        {/* Meme Generator Component */}
        {activeAddress && (
          <div className="animate-fade-in">
            <MemeGenerator />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 font-bold">
            How It Operates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400 font-mono">01</span> Prompt & Style
              </div>
              <p className="text-slate-400 leading-relaxed">
                Describe your concept and select optional humor or visual styling tags.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="text-amber-400 font-mono">02</span> 0.10 USDC Settlement
              </div>
              <p className="text-slate-400 leading-relaxed">
                The server issues an HTTP 402 challenge, settled instantly on Algorand.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">03</span> Ready to Share
              </div>
              <p className="text-slate-400 leading-relaxed">
                High-resolution image rendered with aligned text overlay and download link.
              </p>
            </div>
          </div>
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </div>
  )
}

export default MemeHome
