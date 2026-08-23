import { SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useMemo, useState } from 'react'
import AdsecHome from './AdsecHome'
import Home from './Home'
import MemeHome from './MemeHome'
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
    { id: WalletId.LUTE}
  ]
}

type TabType = 'adsec' | 'weather' | 'meme'

const TABS: { id: TabType; label: string }[] = [
  { id: 'adsec', label: 'Security Node' },
  { id: 'weather', label: 'Weather Demo' },
  { id: 'meme', label: 'Meme Studio' },
]

function ShieldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z"
        className="fill-indigo-600"
      />
      <path d="M12 6l-1.5 4.5H8l3 2.5-1 4 2.5-2.5L15 17l-1-4 3-2.5h-2.5L12 6z" className="fill-white" />
    </svg>
  )
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const [activeTab, setActiveTab] = useState<TabType>('adsec')
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

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          {/* Global Nav */}
          <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
              <button onClick={() => setActiveTab('adsec')} className="flex items-center gap-2.5 shrink-0 group">
                <ShieldMark />
                <span className="font-black tracking-wide text-white text-sm group-hover:text-indigo-300 transition-colors">
                  ADSEC
                </span>
                <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                  x402
                </span>
              </button>

              <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full p-1" aria-label="demos">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-600/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>

              <NavWalletButton onClick={toggleWalletModal} />
            </div>
          </header>

          {/* Tab Content */}
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'adsec' && <AdsecHome />}
            {activeTab === 'weather' && <Home />}
            {activeTab === 'meme' && <MemeHome />}
          </div>

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
