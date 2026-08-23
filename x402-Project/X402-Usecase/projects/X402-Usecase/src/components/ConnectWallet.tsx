import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog
      id="connect_wallet_modal"
      className={openModal ? 'modal-open' : ''}
      style={{
        display: openModal ? 'flex' : 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: 'none',
        width: '100%',
        height: '100%',
        padding: '16px',
      }}
    >
      <div
        className="card animate-scale-in"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          background: 'rgba(10, 14, 23, 0.95)',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.1), var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
            }}>
              🔗
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Connect Algorand Wallet
            </h3>
          </div>
          <p style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            margin: 0,
          }}>
            Select your wallet provider to sign x402 micropayments on TestNet.
          </p>
        </div>

        {/* Connected account display */}
        {activeAddress && (
          <div style={{ marginBottom: '20px' }}>
            <Account />
          </div>
        )}

        {/* Wallet provider buttons */}
        {!activeAddress && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {wallets?.map((wallet) => (
              <button
                type="button"
                data-test-id={`${wallet.id}-connect`}
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-default)',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)'
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`${wallet.metadata.name} icon`}
                    src={wallet.metadata.icon}
                    style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }}
                  />
                )}
                {isKmd(wallet) ? (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}>🔧</div>
                ) : null}
                <span>{isKmd(wallet) ? 'LocalNet Sandbox Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            data-test-id="close-wallet-modal"
            onClick={closeModal}
            className="btn-secondary"
            style={{ padding: '8px 20px', fontSize: '12px' }}
          >
            Close
          </button>
          {activeAddress && (
            <button
              type="button"
              className="btn-secondary"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
              style={{
                padding: '8px 20px',
                fontSize: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
              }}
            >
              Disconnect Wallet
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

export default ConnectWallet
