import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between text-neutral-400">
        <span>Connected Address:</span>
        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {networkName}
        </span>
      </div>
      <div className="text-emerald-300 font-bold break-all">
        {activeAddress}
      </div>
      <div className="pt-1 text-right">
        <a
          className="text-neutral-400 hover:text-emerald-300 text-[11px] underline"
          target="_blank"
          rel="noreferrer"
          href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
        >
          View Account on Lora Explorer ↗
        </a>
      </div>
    </div>
  )
}

export default Account
