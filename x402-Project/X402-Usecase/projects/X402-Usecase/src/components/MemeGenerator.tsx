import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { createX402Fetch } from '../utils/memeApi'

interface MemeStyles {
  styles: string[]
  themes: string[]
  visualStyles: string[]
  enhancementRules: string[]
  models: {
    available: string[]
    primary: string
    descriptions: Record<string, string>
  }
}

const MemeGenerator: React.FC = () => {
  const { activeAddress, signTransactions } = useWallet()
  const [loading, setLoading] = useState(false)
  const [memeData, setMemeData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [availableStyles, setAvailableStyles] = useState<MemeStyles | null>(null)

  // Form state
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('')
  const [selectedVisualStyle, setSelectedVisualStyle] = useState('')
  const [useMultiModel, setUseMultiModel] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4021'

  // Fetch available styles on mount (free endpoint)
  useEffect(() => {
    fetch(`${apiBaseUrl}/meme-styles`)
      .then(res => res.json())
      .then(data => setAvailableStyles(data))
      .catch(err => console.error('Failed to fetch styles:', err))
  }, [apiBaseUrl])

  const handleGenerateMeme = async () => {
    if (!activeAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (!signTransactions) {
      setError('Wallet does not support transaction signing')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a meme prompt')
      return
    }

    setLoading(true)
    setError('')
    setPaymentStatus('')
    setMemeData(null)

    try {
      setPaymentStatus('Initializing payment...')

      const signer = {
        address: activeAddress,
        signTransactions: signTransactions,
      }

      setPaymentStatus('Processing payment (0.1 USDC)...')
      
      const fetchFn = await createX402Fetch(signer)
      const response = await fetchFn(`${apiBaseUrl}/meme-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle || undefined,
          theme: selectedTheme || undefined,
          visualStyle: selectedVisualStyle || undefined,
          useMultiModel: useMultiModel,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPaymentStatus('Payment settled! Meme generated!')
        setMemeData(data)
        setTimeout(() => setPaymentStatus(''), 3000)
      } else {
        throw new Error(data.details || 'Failed to generate meme')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMsg)
      setPaymentStatus('')
      console.error('Meme generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✨ Create Custom Meme</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Micropayment fee: <span className="text-amber-300 font-bold">0.10 USDC</span> per generation
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
          x402 Micropayment Rail
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
          Meme Concept or Prompt *
        </label>
        <textarea
          className="w-full bg-[#05070d] border border-slate-800 rounded-xl p-4 font-mono text-sm text-emerald-300 focus:outline-none focus:border-indigo-500 transition-colors h-24 leading-relaxed"
          placeholder="e.g. When the smart contract compiles cleanly on the first attempt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Style & Theme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Style Selection */}
        {availableStyles && (
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Humor Tone
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              disabled={loading}
            >
              <option value="">Auto-detected</option>
              {availableStyles.styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Theme Selection */}
        {availableStyles && (
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Topic / Theme
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              disabled={loading}
            >
              <option value="">General</option>
              {availableStyles.themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Visual Style Selection */}
        {availableStyles && availableStyles.visualStyles && (
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Visual Art Style
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              value={selectedVisualStyle}
              onChange={(e) => setSelectedVisualStyle(e.target.value)}
              disabled={loading}
            >
              <option value="">Default Art</option>
              {availableStyles.visualStyles.map((vstyle) => (
                <option key={vstyle} value={vstyle}>
                  {vstyle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Multi-Model Toggle */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-xs text-slate-200 font-mono">High-Fidelity Rendering</div>
          <div className="text-[11px] text-slate-400">Combines multiple models for sharper layout and typography</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={useMultiModel}
            onChange={(e) => setUseMultiModel(e.target.checked)}
            disabled={loading}
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Generate Button */}
      <button
        className={`w-full py-3.5 rounded-xl font-bold font-mono text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
          loading || !prompt.trim()
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-98'
        }`}
        onClick={handleGenerateMeme}
        disabled={!activeAddress || loading || !prompt.trim()}
      >
        {loading ? (
          <>
            <span className="animate-caret">█</span>
            <span>Generating & Settling (0.10 USDC)...</span>
          </>
        ) : (
          <>
            <span>Generate Visual</span>
            <span className="text-xs bg-indigo-900/80 px-2 py-0.5 rounded-md">0.10 USDC</span>
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

      {/* Generated Meme Display */}
      {memeData && memeData.success && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <span>✓</span>
            <span>Meme generated and micropayment confirmed on-chain</span>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 flex justify-center bg-black/40">
              <img
                src={memeData.meme.imageUrl}
                alt="Generated Meme"
                className="rounded-xl max-w-full max-h-[480px] object-contain shadow-lg"
              />
            </div>
            <div className="p-5 border-t border-slate-800 space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400 uppercase">Concept</div>
                <div className="text-sm font-medium text-white">{memeData.meme.prompt}</div>
              </div>

              {memeData.meme.generatedText && (
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="text-indigo-300 font-bold">Generated Captions:</div>
                  <div className="text-slate-200"><span className="text-slate-500">Top:</span> {memeData.meme.generatedText.topText}</div>
                  <div className="text-slate-200"><span className="text-slate-500">Bottom:</span> {memeData.meme.generatedText.bottomText}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="text-[11px] font-mono text-slate-400">
                  Model: {memeData.metadata?.model || 'Flux'} · Cost: 0.10 USDC
                </div>
                <a
                  href={memeData.meme.imageUrl}
                  download={`meme-${Date.now()}.png`}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all"
                >
                  Download Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemeGenerator
