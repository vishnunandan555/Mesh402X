import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useState } from 'react'
import AdsecHome from './AdsecHome'
import Home from './Home'
import MemeHome from './MemeHome'
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

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const [activeTab, setActiveTab] = useState<TabType>('adsec')

  const walletManager = new WalletManager({
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
  })

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <div className="min-h-screen bg-slate-950">
          {/* Tab Navigation */}
          <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('adsec')}
                  className={`px-6 py-4 font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'adsec'
                      ? 'text-indigo-400 border-b-4 border-indigo-500 bg-indigo-950/40 shadow-sm'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span>🛡️ ADSEC Security Node</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                    3 Green Cards
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`px-5 py-4 font-medium text-xs transition-all ${
                    activeTab === 'weather'
                      ? 'text-teal-400 border-b-4 border-teal-500 bg-teal-950/40'
                      : 'text-slate-500 hover:text-teal-300 hover:bg-slate-800/30'
                  }`}
                >
                  🌤️ Weather Demo
                </button>
                <button
                  onClick={() => setActiveTab('meme')}
                  className={`px-5 py-4 font-medium text-xs transition-all ${
                    activeTab === 'meme'
                      ? 'text-purple-400 border-b-4 border-purple-500 bg-purple-950/40'
                      : 'text-slate-500 hover:text-purple-300 hover:bg-slate-800/30'
                  }`}
                >
                  🎨 Meme Generator
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === 'adsec' && <AdsecHome />}
            {activeTab === 'weather' && <Home />}
            {activeTab === 'meme' && <MemeHome />}
          </div>
        </div>
      </WalletProvider>
    </SnackbarProvider>
  )
}
