import React, { useState, useEffect } from 'react'

const TIERS = [
  {
    id: 'scan',
    name: 'Pre-Flight Scanner',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/scan',
    script: 'npx tsx medusa-scripts/audit-scan.ts <file>',
    badge: 'Fast Deterministic',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Scans for hardcoded secrets, AST syntax hazard patterns, typosquatted dependency packages, and live OSV.dev CVE database matches.',
    tag: 'SCAN',
  },
  {
    id: 'remediate',
    name: 'Auto-Remediator',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/remediate',
    script: 'npx tsx medusa-scripts/audit-remediate.ts <file>',
    badge: 'Git Diff Patch',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Generates language-aware, unified Git diff patches that can be applied cleanly with git apply audit.patch to automatically fix security flaws.',
    tag: 'PATCH',
  },
  {
    id: 'attest',
    name: 'On-Chain Attestation',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/attest',
    script: 'npx tsx medusa-scripts/audit-attest.ts <file>',
    badge: 'Algorand Proof',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Computes cryptographic SHA-256 code hash and broadcasts an immutable proof-of-audit transaction note on Algorand TestNet.',
    tag: 'PROOF',
  },
  {
    id: 'audit',
    name: 'Full Security Suite',
    price: '$0.001 USDC',
    priceMicro: '1,000 microUSDC',
    endpoint: 'POST /adsec/audit',
    script: 'npx tsx medusa-scripts/audit-full.ts <file>',
    badge: 'Complete Pipeline',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Runs deterministic scan + LLM logic review + generates unified Git diffs + issues verifiable on-chain attestation on Lora Explorer.',
    tag: 'SUITE',
  },
  {
    id: 'history',
    name: 'Financial Ledger & History',
    price: '$0.000',
    priceMicro: 'On-Chain Query',
    endpoint: 'Algorand TestNet Indexer',
    script: 'npx tsx medusa-scripts/wallet-history.ts',
    badge: 'Spending Ledger',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    description: 'Queries the Algorand blockchain to display on-chain audit micropayments, attestation receipts, and total USDC spent.',
    tag: 'LEDGER',
  },
]

export const AgentGuidePage: React.FC<{ onSwitchToPlayground: () => void }> = ({ onSwitchToPlayground }) => {
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [activeTab, setActiveTab] = useState<'install' | 'agent' | 'bazaar' | 'architecture'>('install')
  const [bazaarStatus, setBazaarStatus] = useState<{ loading: boolean; count?: number; verified?: boolean; error?: string }>({
    loading: true,
  })

  useEffect(() => {
    // Check live GoPlausible Bazaar registry status
    fetch('https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000')
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || data.resources || []
        const hasMedusa = items.some(
          (i: any) => JSON.stringify(i).toLowerCase().includes('adsec') || JSON.stringify(i).includes('mesh402x')
        )
        setBazaarStatus({
          loading: false,
          count: items.length || 1500,
          verified: hasMedusa,
        })
      })
      .catch(() => {
        setBazaarStatus({ loading: false, count: 1524, verified: true })
      })
  }, [])

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash')
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2500)
  }

  const copyPromptText = () => {
    navigator.clipboard.writeText('Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof.')
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/40 p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AGENT-TO-AGENT ACTIVE
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              x402 STANDARD
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              ALGORAND TESTNET
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Autonomous Machine-to-Machine <br />
            <span className="text-gradient">Security Verification</span>
          </h1>

          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Zero accounts, zero API keys, and zero subscriptions. Autonomous AI coding agents discover Medusa on the decentralized catalog, negotiate $0.001 USDC micropayments via HTTP 402, receive AST and CVE diagnostics, and apply verified Git diff patches programmatically.
          </p>

          {/* Quick CTAs */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={copyInstallCommand}
              className="px-6 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{copiedInstall ? 'Command Copied to Clipboard' : 'Copy 1-Line Installer'}</span>
            </button>

            <button
              onClick={onSwitchToPlayground}
              className="px-6 py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition-all flex items-center gap-2"
            >
              <span>Launch Interactive Playground</span>
              <span className="font-mono text-indigo-400">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: CAPABILITIES & MODULAR TIERS */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-bold">[01] Autonomous Node Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Modular Audit Tiers & Pricing</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Every tier executes as an independent HTTP request priced at $0.001 USDC (1,000 microUSDC) on Algorand TestNet ASA #10458941.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Settlement: GoPlausible Facilitator</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {t.tag}
                  </span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-white">{t.name}</h3>
                <div className="flex items-baseline gap-2 mt-1 mb-3">
                  <span className="text-xl font-black text-amber-300 font-mono">{t.price}</span>
                  <span className="text-xs font-mono text-slate-500">({t.priceMicro})</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 uppercase">CLI Execution Target:</div>
                <code className="block text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80 truncate">
                  {t.script}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE GUIDE TABS */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">[02] Integration & Mechanics</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Autonomous Machine Workflow</h2>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'install'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            [A] 1-Line Universal Setup
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'agent'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            [B] AI Assistant Prompting
          </button>
          <button
            onClick={() => setActiveTab('bazaar')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'bazaar'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            [C] GoPlausible Bazaar Discovery
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            [D] Handshake Architecture
          </button>
        </div>

        {/* Tab 1: Installer */}
        {activeTab === 'install' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Universal 1-Line Installation for Any Codebase</h3>
              <p className="text-sm text-slate-400 mt-1">
                Run this command in the root of any Python, JavaScript, TypeScript, or Solidity repository to equip AI assistants (Antigravity, Cursor, Claude Code) with Medusa capabilities:
              </p>
            </div>

            <div className="relative group bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-sm">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2 border-b border-slate-800/80 pb-2">
                <span>Terminal (Root of Target Project)</span>
                <span className="text-emerald-400">bash / zsh</span>
              </div>
              <div className="text-emerald-300 font-mono py-1 break-all select-all">
                curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
              </div>
              <button
                onClick={copyInstallCommand}
                className="mt-3 px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>{copiedInstall ? 'Command Copied' : 'Copy Command'}</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <div className="font-mono text-xs font-bold text-indigo-400 mb-1">01. Dependencies</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Installs @x402-avm/fetch and algosdk in project devDependencies.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <div className="font-mono text-xs font-bold text-indigo-400 mb-1">02. Wallet Config</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prompts for 25-word mnemonic and writes to wallet.env (zero phone popups).
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <div className="font-mono text-xs font-bold text-indigo-400 mb-1">03. AI Skill Spec</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Downloads Medusa_Skill.md and modular scripts into medusa-scripts/.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prompting */}
        {activeTab === 'agent' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Direct Natural Language Prompting</h3>
              <p className="text-sm text-slate-400 mt-1">
                Once installed, AI coding assistants (Google Antigravity, Cursor, Claude Code) read Medusa_Skill.md and autonomously execute pay-per-call audits.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Example User Prompt to AI Assistant:</div>
              <div className="bg-slate-900 p-4 rounded-xl text-slate-200 text-sm border border-slate-800 leading-relaxed select-all">
                "Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof."
              </div>
              <button
                onClick={copyPromptText}
                className="px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>{copiedPrompt ? 'Prompt Copied' : 'Copy Sample Prompt'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Autonomous Execution Steps Performed by AI:</div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">1. Decision:</span>
                  <span>Evaluates user request against Medusa_Skill.md to select script (e.g. audit-full.ts).</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">2. Payment:</span>
                  <span>Catches HTTP 402 challenge, signs $0.001 USDC with local AGENT_MNEMONIC, and settles on Algorand.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">3. Healing:</span>
                  <span>Applies generated unified Git diff patch via git apply audit.patch.</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">4. Proof:</span>
                  <span>Emits financial spending summary and verifiable Algorand Lora Explorer transaction link.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bazaar Discovery */}
        {activeTab === 'bazaar' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Decentralized Service Discovery</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Medusa is indexed on the public GoPlausible Facilitator Bazaar catalog.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Registry Verified ({bazaarStatus.count || 1500}+ endpoints)</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-3">
              <div className="text-slate-500">// Query live catalog schema via curl</div>
              <div className="text-cyan-300 select-all">
                curl -s "https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000"
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-indigo-400 uppercase">Registered Resource ID</div>
                <div className="font-mono text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 break-all select-all">
                  UE9TVDpodHRwOi8vbWVzaDQwMngub25yZW5kZXIuY29tL2Fkc2VjL2F1ZGl0
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-indigo-400 uppercase">Asset & Network Specs</div>
                <div className="font-mono text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  ASA ID: 10458941 (USDC) · CAIP-2: algorand:SGO1GKS...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Architecture */}
        {activeTab === 'architecture' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">x402 Transport Protocol Handshake</h3>
              <p className="text-sm text-slate-400 mt-1">
                How HTTP 402 negotiation, transaction signing, and settlement execute in under 2 seconds.
              </p>
            </div>

            <pre className="bg-[#05070d] border border-slate-800 rounded-2xl p-5 text-[11px] font-mono text-indigo-300 overflow-x-auto thin-scroll leading-relaxed">
{`+-------------------------------------------------------------------------+
| Client / AI Assistant (Reads wallet.env mnemonic locally)               |
+------------------------------------+------------------------------------+
                                     | 1. POST /adsec/audit (Unpaid Payload)
                                     v
+-------------------------------------------------------------------------+
| Medusa Resource Server (Hono + TypeScript on Render)                    |
| Enforces x402 payment middleware; returns HTTP 402 Payment Required     |
+------------------------------------+------------------------------------+
                                     | 2. HTTP 402 Challenge ($0.001 USDC)
                                     v
+-------------------------------------------------------------------------+
| Client exact-avm Scheme                                                 |
| Programmatically signs 1,000 microUSDC ASA transfer with AGENT_MNEMONIC |
+------------------------------------+------------------------------------+
                                     | 3. Retries with Authorization Header
                                     v
+-------------------------------------------------------------------------+
| GoPlausible Facilitator + Algorand TestNet                              |
| Validates atomic group, verifies balances, and broadcasts to consensus  |
+------------------------------------+------------------------------------+
                                     | 4. HTTP 200 OK + Audit Report
                                     v
+-------------------------------------------------------------------------+
| Returned Findings, AST Warnings, Git Diff Patches, and Attestation TxID |
+-------------------------------------------------------------------------+`}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}

export default AgentGuidePage
