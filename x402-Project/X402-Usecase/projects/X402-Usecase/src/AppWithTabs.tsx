import { SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useMemo, useState } from 'react'
import AdsecHome from './AdsecHome'
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

const NAV_LINKS = [
  { id: 'playground', label: 'Security Auditor' },
  { id: 'pipeline', label: 'How It Works' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'ledger-section', label: 'On-Chain Ledger' },
]

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
          {/* GLOBAL STICKY HEADER */}
          <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <a href="#" className="flex items-center gap-2.5 shrink-0 group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-black text-xs text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                    🐍
                  </div>
                  <div className="text-left">
                    <div className="font-black text-sm tracking-wider text-white flex items-center gap-1.5">
                      MEDUSA
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        x402
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-full p-1" aria-label="sections">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              <NavWalletButton onClick={toggleWalletModal} />
            </div>
          </header>

          {/* Main App Content */}
          <main className="flex-1">
            <AdsecHome />
          </main>

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
      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-2 ${
        activeAddress
          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
          : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${activeAddress ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></span>
      {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connect Wallet'}
    </button>
  )
}
