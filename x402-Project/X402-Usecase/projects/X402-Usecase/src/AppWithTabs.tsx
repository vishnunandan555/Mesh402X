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
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
          {/* ═══ HEADER ═══ */}
          <header className="sticky top-0 z-50" style={{
            background: 'rgba(6, 8, 13, 0.85)',
            backdropFilter: 'blur(20px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {/* Animated gradient line at very top */}
            <div className="animate-gradient" style={{
              height: '2px',
              background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #10b981)',
              backgroundSize: '200% 200%',
            }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Logo */}
              <button
                onClick={() => setActiveTab('guide')}
                className="flex items-center gap-3 shrink-0 group"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  transition: 'transform var(--transition-fast)',
                }}>
                  🐍
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 900,
                    fontSize: '15px',
                    letterSpacing: '0.08em',
                    color: '#fff',
                  }}>
                    MEDUSA
                    <span className="badge-emerald" style={{ fontSize: '9px', padding: '2px 8px', letterSpacing: '0.1em' }}>
                      x402
                    </span>
                  </div>
                </div>
              </button>

              {/* Navigation Tabs */}
              <nav
                className="flex items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px',
                }}
                aria-label="Main Navigation"
              >
                <NavTab
                  active={activeTab === 'guide'}
                  onClick={() => setActiveTab('guide')}
                  icon="📖"
                  label="Agent & Dev Guide"
                />
                <NavTab
                  active={activeTab === 'playground'}
                  onClick={() => setActiveTab('playground')}
                  icon="⚡"
                  label="Live Playground"
                />
              </nav>

              {/* Wallet Button */}
              <NavWalletButton onClick={toggleWalletModal} />
            </div>
          </header>

          {/* ═══ MAIN CONTENT ═══ */}
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

/* ─── Tab Button ─── */
function NavTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 18px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all var(--transition-default)',
        background: active
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'transparent',
        color: active ? '#000' : 'var(--text-secondary)',
        boxShadow: active ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
      }}
    >
      <span>{icon}</span>
      <span className="hide-mobile">{label}</span>
    </button>
  )
}

/* ─── Wallet Button ─── */
function NavWalletButton({ onClick }: { onClick: () => void }) {
  const { activeAddress } = useWallet()
  return (
    <button
      onClick={onClick}
      data-test-id="nav-wallet-button"
      style={{
        flexShrink: 0,
        padding: '8px 16px',
        borderRadius: 'var(--radius-lg)',
        fontSize: '12px',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all var(--transition-default)',
        border: activeAddress
          ? '1px solid rgba(16, 185, 129, 0.5)'
          : '1px solid transparent',
        background: activeAddress
          ? 'rgba(16, 185, 129, 0.1)'
          : 'linear-gradient(135deg, #10b981, #059669)',
        color: activeAddress ? '#6ee7b7' : '#000',
        boxShadow: activeAddress
          ? 'inset 0 0 15px rgba(16, 185, 129, 0.05)'
          : '0 4px 16px rgba(16, 185, 129, 0.3)',
      }}
    >
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: activeAddress ? '#10b981' : 'rgba(255,255,255,0.8)',
        animation: activeAddress ? 'radar-ping 2s cubic-bezier(0,0,0.2,1) infinite' : 'none',
        position: 'relative',
      }}>
        {activeAddress && (
          <span style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#10b981',
          }} />
        )}
      </span>
      <span className="hide-mobile">
        {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connect Wallet'}
      </span>
      <span className="show-mobile-only">
        {activeAddress ? `${activeAddress.slice(0, 4)}..` : 'Wallet'}
      </span>
    </button>
  )
}
