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
    <dialog id="connect_wallet_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <form method="dialog" className="modal-box bg-[#0d0d0d] text-neutral-100 border border-white/10 rounded-2xl shadow-2xl max-w-md">
        <h3 className="font-bold text-xl text-white">Connect Algorand Wallet</h3>
        <p className="text-xs font-mono text-neutral-400 mt-1">Select your wallet provider to sign x402 micropayments on TestNet.</p>

        <div className="pt-4 space-y-2">
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
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 hover:border-emerald-500/50 text-white font-medium text-sm transition-all"
                key={`provider-${wallet.id}`}
                onClick={() => {
                  return wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`${wallet.metadata.name} icon`}
                    src={wallet.metadata.icon}
                    className="w-6 h-6 object-contain rounded"
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Sandbox Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="modal-action mt-6 flex justify-end gap-2">
          <button
            type="button"
            data-test-id="close-wallet-modal"
            className="px-5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 transition-all"
            onClick={() => {
              closeModal()
            }}
          >
            Close
          </button>
          {activeAddress && (
            <button
              type="button"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 transition-all"
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
              Disconnect Wallet
            </button>
          )}
        </div>
      </form>
    </dialog>
  )
}
export default ConnectWallet
