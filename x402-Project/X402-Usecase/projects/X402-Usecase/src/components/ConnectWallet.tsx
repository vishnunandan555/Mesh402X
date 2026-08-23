import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import Account from './Account'
import { IconX } from './icons'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  return (
    <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box bg-base-900 text-base-200 border border-base-700 rounded-2xl shadow-pop max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-xl text-base-100">Connect Algorand wallet</h3>
            <p className="text-xs font-mono text-base-400 mt-1.5">Select a provider to sign x402 micropayments on TestNet.</p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            data-test-id="close-wallet-modal"
            onClick={closeModal}
            className="shrink-0 p-1.5 rounded-lg text-base-500 hover:text-base-100 hover:bg-white/5 transition-all duration-200 focus-ring active:scale-[0.98]"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="pt-5 space-y-2">
          {activeAddress && (
            <div className="mb-4">
              <Account />
            </div>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                type="button"
                data-test-id={`${wallet.id}-connect`}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-base-700 bg-base-950/60 hover:bg-white/[0.05] hover:border-accent/50 text-base-100 font-medium text-sm transition-all duration-200 focus-ring active:scale-[0.99]"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <img alt="" aria-hidden="true" src={wallet.metadata.icon} className="w-6 h-6 object-contain rounded-md" />
                )}
                <span>{isKmd(wallet) ? 'LocalNet sandbox wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="modal-action mt-6 flex justify-end gap-2">
          {activeAddress && (
            <button
              type="button"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-500/[0.08] hover:bg-red-500/15 border border-red-500/30 text-red-300 transition-all duration-200 focus-ring active:scale-[0.98]"
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
            >
              Disconnect wallet
            </button>
          )}
        </div>
      </form>
    </dialog>
  )
}
export default ConnectWallet
