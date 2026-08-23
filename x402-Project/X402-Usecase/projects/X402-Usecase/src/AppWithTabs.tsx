import { SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useMemo, useState } from 'react'
import AdsecHome from './AdsecHome'
import AgentGuidePage from './components/AgentGuidePage'
import ConnectWallet from './components/ConnectWallet'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    { id: WalletId.LUTE }
  ]
}

export type MainTab = 'guide' | 'playground'

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<MainTab>('guide')

  const walletManager = useMemo(
    () =>
      new WalletManager({
        wallets: supportedWallets,
        defaultNetwork: algodConfig.network,
        networks: {
          [algodConfig.network]: {
            algod: {
              baseServer: algodConfig.server,
              port: algodConfig.port,
              token: String(algodConfig.token),
            },
          },
        },
        options: {
          resetNetwork: true,
        },
      }),
    []
  )

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
          {/* GLOBAL STICKY HEADER */}
          <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('guide')}
                  className="flex items-center gap-2.5 shrink-0 group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-black text-xs text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                    M
                  </div>
                  <div>
                    <div className="font-black text-sm tracking-wider text-white flex items-center gap-1.5">
                      MEDUSA
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        x402
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Main Dual-Page Navigation Tabs */}
              <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-1 shadow-inner" aria-label="Main Navigation">
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono text-indigo-300">[01]</span>
                  <span>Agent & Dev Guide</span>
                </button>

                <button
                  onClick={() => setActiveTab('playground')}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'playground'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-mono text-cyan-300">[02]</span>
                  <span>Interactive Playground</span>
                </button>
              </nav>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                <HeaderWalletButton onToggleModal={toggleWalletModal} />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1">
            {activeTab === 'guide' ? (
              <AgentGuidePage onSwitchToPlayground={() => setActiveTab('playground')} />
            ) : (
              <AdsecHome />
            )}
          </main>
        </div>

        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </WalletProvider>
    </SnackbarProvider>
  )
}

function HeaderWalletButton({ onToggleModal }: { onToggleModal: () => void }) {
  const { activeAddress } = useWallet()

  return (
    <button
      onClick={onToggleModal}
      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
        activeAddress
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95'
      }`}
    >
      {activeAddress ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</span>
        </>
      ) : (
        <>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  )
}
