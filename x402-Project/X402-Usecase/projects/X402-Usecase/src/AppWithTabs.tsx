import { SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useMemo, useState } from 'react'
import AdsecHome from './AdsecHome'
import AgentGuidePage from './components/AgentGuidePage'
import ConnectWallet from './components/ConnectWallet'
import { MedusaMark, IconBook, IconBolt, IconWallet } from './components/icons'
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
  supportedWallets = [{ id: WalletId.DEFLY }, { id: WalletId.PERA }, { id: WalletId.EXODUS }, { id: WalletId.LUTE }]
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
    [],
  )

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-base-950 text-base-300 flex flex-col">
          {/* Film-grain overlay — breaks digital flatness */}
          <div className="grain fixed inset-0 z-30 pointer-events-none" aria-hidden="true" />

          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-base-ink focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>

          {/* GLOBAL STICKY HEADER */}
          <header className="sticky top-0 z-50 bg-base-950/85 backdrop-blur-xl border-b border-base-800">
            <div className="max-w-shell mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-6 min-w-0">
                <button onClick={() => setActiveTab('guide')} className="flex items-center gap-2.5 shrink-0 group focus-ring rounded-lg">
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                    <MedusaMark size={28} />
                  </span>
                  <span className="font-display font-semibold text-[15px] tracking-tight text-base-100 flex items-center gap-2">
                    Medusa
                    <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border border-accent/40 bg-accent/10 text-accent tnum">
                      x402
                    </span>
                  </span>
                </button>
              </div>

              {/* Main Dual-Page Navigation Tabs */}
              <nav className="flex items-center gap-1 bg-base-900/70 border border-base-800 rounded-full p-1" aria-label="Main navigation">
                <button
                  onClick={() => setActiveTab('guide')}
                  aria-current={activeTab === 'guide' ? 'page' : undefined}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 focus-ring ${
                    activeTab === 'guide' ? 'bg-accent text-base-ink shadow-glow' : 'text-base-400 hover:text-base-100 hover:bg-white/5'
                  }`}
                >
                  <IconBook size={13} />
                  <span>Agent guide</span>
                </button>
                <button
                  onClick={() => setActiveTab('playground')}
                  aria-current={activeTab === 'playground' ? 'page' : undefined}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 focus-ring ${
                    activeTab === 'playground'
                      ? 'bg-accent text-base-ink shadow-glow'
                      : 'text-base-400 hover:text-base-100 hover:bg-white/5'
                  }`}
                >
                  <IconBolt size={13} />
                  <span>Live playground</span>
                </button>
              </nav>

              {/* Wallet Connection Header Button */}
              <div className="flex items-center gap-3">
                <NavWalletButton onClick={toggleWalletModal} />
              </div>
            </div>
          </header>

          {/* Main Content View Switcher */}
          <main id="main-content" className="flex-1">
            {activeTab === 'guide' ? <AgentGuidePage onSwitchToPlayground={() => setActiveTab('playground')} /> : <AdsecHome />}
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
      className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border flex items-center gap-2 focus-ring active:scale-[0.98] tnum ${
        activeAddress
          ? 'bg-accent/10 border-accent/50 text-accent hover:border-accent'
          : 'bg-accent hover:bg-accent-bright border-accent text-base-ink shadow-glow'
      }`}
    >
      <IconWallet size={14} />
      <span className={`w-1.5 h-1.5 rounded-full ${activeAddress ? 'bg-accent animate-pulse' : 'bg-base-ink/70'}`}></span>
      <span className="hidden sm:inline">
        {activeAddress ? `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}` : 'Connect wallet'}
      </span>
      <span className="sm:hidden">{activeAddress ? `${activeAddress.slice(0, 4)}…` : 'Wallet'}</span>
    </button>
  )
}
