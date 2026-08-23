import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { fetchWeatherWithPayment, formatWeatherData } from '../utils/weatherApi'

const Weather: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet()
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021'
  const weatherUrl = `${apiBaseUrl}/weather`

  const handleRequestWeather = async () => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (!signTransactions) {
      setError('Wallet does not support transaction signing')
      return
    }

    setLoading(true)
    setError('')
    setPaymentStatus('')
    setWeatherData(null)

    try {
      setPaymentStatus('Requesting weather data...')

      // Create a signer compatible with x402
      const signer = {
        address: activeAddress,
        signTransactions: signTransactions,
      }

      setPaymentStatus('Processing payment...')
      const data = await fetchWeatherWithPayment(weatherUrl, signer)

      setPaymentStatus('Payment settled!')
      setWeatherData(data)
      setPaymentStatus('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMsg)
      setPaymentStatus('')
      console.error('Weather request error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🌦️ Live Weather Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Query rate: <span className="text-amber-300 font-bold">$0.005 USDC</span> per call · HTTP 402 Metered
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-teal-300">
          GET /weather
        </div>
      </div>

      {/* Query Action Button */}
      <button
        className={`w-full py-3.5 rounded-xl font-bold font-mono text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
          loading
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30 active:scale-98'
        }`}
        onClick={handleRequestWeather}
        disabled={!activeAddress || loading}
      >
        {loading ? (
          <>
            <span className="animate-caret">█</span>
            <span>Settling $0.005 USDC & Fetching...</span>
          </>
        ) : (
          <>
            <span>Query Live Weather Data</span>
            <span className="text-xs bg-teal-900/80 px-2 py-0.5 rounded-md">$0.005 USDC</span>
          </>
        )}
      </button>

      {/* Payment Status Message */}
      {paymentStatus && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3.5 text-amber-200 text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{paymentStatus}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-3.5 text-red-200 text-xs font-mono flex items-center gap-2">
          <span className="text-red-400 font-bold">Notice:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData && (
        <div className="space-y-4 pt-2">
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <span>✓</span>
            <span>Payload unlocked and micropayment settled on Algorand</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070d]">
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800">
              <span>Response Payload (JSON)</span>
              <span className="text-emerald-400 font-bold">200 OK</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed thin-scroll max-h-72">
              <code>{formatWeatherData(weatherData)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default Weather
