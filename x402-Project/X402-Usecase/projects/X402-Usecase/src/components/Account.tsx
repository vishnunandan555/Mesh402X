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
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(6, 182, 212, 0.04))',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Connected Address:
        </span>
        <span className="badge-emerald" style={{ fontSize: '9px', fontWeight: 800 }}>
          {networkName}
        </span>
      </div>
      <div style={{
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        color: '#6ee7b7',
        wordBreak: 'break-all',
        lineHeight: 1.5,
      }}>
        {activeAddress}
      </div>
      <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'right' }}>
        <a
          href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          View Account on Lora Explorer ↗
        </a>
      </div>
    </div>
  )
}

export default Account
