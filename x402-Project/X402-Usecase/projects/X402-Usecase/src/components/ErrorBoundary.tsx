import React, { ReactNode } from 'react'

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
        <div style={{
          minHeight: '100vh',
          background: 'var(--bg-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'var(--font-sans)',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'rgba(10, 14, 23, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-2xl)',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.08), var(--shadow-xl)',
          }}>
            {/* Error icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px',
            }}>
              ⚠️
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              Application Error
            </h1>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              margin: '0 0 24px',
            }}>
              {this.state.error?.message.includes('Attempt to get default algod configuration')
                ? 'Please make sure to set up your environment variables correctly. Create a .env file based on .env.template and fill in the required values. This controls the network and credentials for connections with Algod and Indexer.'
                : this.state.error?.message}
            </p>

            <div style={{
              background: '#080c14',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '24px',
              textAlign: 'left',
            }}>
              <p style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.6,
              }}>
                <span style={{ color: '#f87171' }}>error: </span>
                <span style={{ color: '#fca5a5' }}>{this.state.error?.message}</span>
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                fontSize: '14px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                transition: 'all 250ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
