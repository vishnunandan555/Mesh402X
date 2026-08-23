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
      <form method="dialog" className="modal-box bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl shadow-2xl max-w-md">
        <h3 className="font-bold text-xl text-white">Connect Algorand Wallet</h3>
        <p className="text-xs font-mono text-slate-400 mt-1">Select your wallet provider to sign x402 micropayments on TestNet.</p>

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
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-700/80 bg-slate-950 hover:bg-slate-800 hover:border-slate-500 text-slate-100 font-medium text-sm transition-all"
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
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
            onClick={() => {
              closeModal()
            }}
          >
            Close
          </button>
          {activeAddress && (
            <button
              type="button"
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all"
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
