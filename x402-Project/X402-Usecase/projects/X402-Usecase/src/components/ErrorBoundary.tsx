import React, { ReactNode } from 'react'
import { MedusaMark } from './icons'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-base-800 bg-base-900/70 shadow-pop p-8 text-center space-y-5">
            <div className="flex justify-center">
              <MedusaMark size={44} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-base-100">Something went wrong</h1>
              <p className="mt-3 text-xs font-mono text-base-400 leading-relaxed break-words">
                {this.state.error?.message.includes('Attempt to get default algod configuration')
                  ? 'Environment variables are missing. Create a .env file based on .env.template and fill in the values — they control the network and credentials for Algod and Indexer connections.'
                  : this.state.error?.message || 'An unexpected error interrupted the application.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent hover:bg-accent-bright text-base-ink shadow-glow transition-all duration-200 active:scale-[0.98] focus-ring"
            >
              Reload Medusa
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
