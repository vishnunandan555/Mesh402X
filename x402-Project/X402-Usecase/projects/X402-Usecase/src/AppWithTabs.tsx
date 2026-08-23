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
        <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-white">
          {/* GLOBAL STICKY HEADER */}
          <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('guide')}
                  className="flex items-center gap-2.5 shrink-0 group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-xs text-black shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                    🐍
                  </div>
                  <div>
                    <div className="font-black text-sm tracking-wider text-white flex items-center gap-1.5">
                      MEDUSA
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                        x402
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Main Dual-Page Navigation Tabs */}
              <nav className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1" aria-label="Main Navigation">
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>📖</span>
                  <span>Agent & Dev Guide</span>
                </button>
                <button
                  onClick={() => setActiveTab('playground')}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'playground'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>⚡</span>
                  <span>Live Web Playground</span>
                </button>
              </nav>

              {/* Wallet Connection Header Button */}
              <div className="flex items-center gap-3">
                <NavWalletButton onClick={toggleWalletModal} />
              </div>
            </div>
          </header>

          {/* Main Content View Switcher */}
          <main className="flex-1">
            {activeTab === 'guide' ? (
              <AgentGuidePage onSwitchToPlayground={() => setActiveTab('playground')} />
            ) : (
              <AdsecHome />
            )}
          </main>

          {/* Global Wallet Modal */}
          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        </div>
      </WalletProvider>
    </SnackbarProvider>
  )
}

function NavWalletButton({ onClick }: { onClick: () => void }) {
  const { activeAddress } = useWallet()
  return (
    <button
      onClick={onClick}
      data-test-id="nav-wallet-button"
      className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-2 ${
        activeAddress
          ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
          : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-black shadow-lg shadow-emerald-500/25 active:scale-95'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${activeAddress ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></span>
      <span className="hidden sm:inline">
        {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connect Wallet'}
      </span>
      <span className="sm:hidden">
        {activeAddress ? `${activeAddress.slice(0, 4)}..` : 'Wallet'}
      </span>
    </button>
  )
}
