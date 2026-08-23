import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { IconExternal } from './icons'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div className="bg-base-950/70 border border-base-700 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between text-base-400">
        <span>Connected address</span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/30">{networkName}</span>
      </div>
      <div className="text-accent font-semibold break-all tnum">{activeAddress}</div>
      <div className="pt-1 text-right">
        <a
          className="inline-flex items-center gap-1 text-base-400 hover:text-accent transition-colors duration-200 text-[11px] focus-ring rounded-sm"
          target="_blank"
          rel="noreferrer"
          href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
        >
          View account on Lora explorer <IconExternal size={10} />
        </a>
      </div>
    </div>
  )
}

export default Account
