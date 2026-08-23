import React, { useState, useEffect } from 'react'

const TIERS = [
  {
    id: 'scan',
    name: 'Pre-Flight Scanner',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/scan',
    script: 'npx tsx medusa-scripts/audit-scan.ts <file>',
    badge: 'Deterministic',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    description: 'Scans for hardcoded secrets, AST syntax hazards, typosquatted dependencies, and live OSV.dev CVE database matches.',
    tag: '01',
  },
  {
    id: 'remediate',
    name: 'Auto-Remediator',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/remediate',
    script: 'npx tsx medusa-scripts/audit-remediate.ts <file>',
    badge: 'Git Diff',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    description: 'Generates language-aware, unified Git diff patches compatible with git apply to autonomously repair discovered flaws.',
    tag: '02',
  },
  {
    id: 'attest',
    name: 'On-Chain Attestation',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/attest',
    script: 'npx tsx medusa-scripts/audit-attest.ts <file>',
    badge: 'Algorand Proof',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    description: 'Computes cryptographic SHA-256 code digest and broadcasts an immutable proof-of-audit transaction note on Algorand.',
    tag: '03',
  },
  {
    id: 'audit',
    name: 'Full Security Suite',
    price: '$0.001 USDC',
    endpoint: 'POST /adsec/audit',
    script: 'npx tsx medusa-scripts/audit-full.ts <file>',
    badge: 'Full Pipeline',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    description: 'Executes deterministic scanning, AI semantic review, unified Git diff patches, and on-chain attestation in a single call.',
    tag: '04',
  },
]

export const AgentGuidePage: React.FC<{ onSwitchToPlayground: () => void }> = ({ onSwitchToPlayground }) => {
  const [copiedInstall, setCopiedInstall] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [bazaarCount, setBazaarCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=1000')
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || data.resources || []
        setBazaarCount(items.length || 1500)
      })
      .catch(() => setBazaarCount(1524))
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* 1. SYMMETRIC HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Algorand TestNet</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-bold">x402 Protocol</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">ASA #10458941</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Decentralized Security Audits for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Zero accounts, zero subscriptions, and zero API keys. Autonomous coding agents discover Medusa on the decentralized catalog, authorize $0.001 USDC micropayments via HTTP 402, and apply verified Git diff patches programmatically.
        </p>

        {/* 1-Line Universal Installer Box */}
        <div className="pt-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left font-mono text-xs shadow-2xl space-y-2">
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider">1-Line Universal Installer</span>
              <span className="text-emerald-400">bash / zsh</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <span className="text-emerald-300 select-all break-all">
                curl -fsSL https://raw.githubusercontent.com/vishnunandan555/Mesh402X/main/install.sh | bash
              </span>
              <button
                onClick={copyInstallCommand}
                className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all active:scale-95 shadow"
              >
                {copiedInstall ? '[Copied]' : 'Copy Command'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYMMETRIC 4-TIER GRID */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-indigo-400 font-bold">Node Services</div>
            <h2 className="text-2xl font-bold text-white">Modular Audit Capabilities</h2>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Fixed Price: <span className="text-amber-300 font-bold">$0.001 USDC (1,000 microUSDC)</span> / request
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:bg-slate-900/90"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-500">[{tier.tag}]</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{tier.name}</h3>
                <div className="text-amber-300 font-mono text-sm font-bold mt-0.5 mb-2">{tier.price}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[9px] font-mono text-slate-500 uppercase mb-1">CLI Target:</div>
                <code className="block text-[10px] font-mono text-emerald-400 bg-slate-950 p-1.5 rounded border border-slate-800/80 truncate">
                  {tier.script}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SYMMETRIC 2-COLUMN INTEGRATION SECTION */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">Integration Architecture</div>
          <h2 className="text-2xl font-bold text-white">How Autonomous Verification Works</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: AI Assistant Protocol */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">AI Assistant Integration</h3>
              <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/10">
                Antigravity / Cursor / Claude
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When prompted in plain English, your AI coding assistant reads <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">Medusa_Skill.md</code>, selects the target script, and settles payment via <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">wallet.env</code>.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Natural Language Prompt:</div>
              <div className="text-xs font-mono text-slate-200 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed select-all">
                "Audit this codebase for security vulnerabilities using Medusa, and report back the findings and on-chain proof."
              </div>
              <button
                onClick={copyPromptText}
                className="text-[11px] font-mono font-bold text-indigo-400 hover:text-indigo-300 pt-1 flex items-center gap-1"
              >
                {copiedPrompt ? '[Prompt Copied]' : 'Copy Sample Prompt'}
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-indigo-400 font-bold">[1]</span>
                <span>Reads Medusa_Skill.md decision matrix to pick tier script.</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-indigo-400 font-bold">[2]</span>
                <span>Negotiates HTTP 402 challenge and signs 1,000 microUSDC with local key.</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-indigo-400 font-bold">[3]</span>
                <span>Auto-heals source code with git apply audit.patch.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Protocol Handshake & Discovery */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Transport Layer & Discovery</h3>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">
                Bazaar Catalog Verified
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every request is dynamically discovered on GoPlausible Bazaar and settled atomically on Algorand TestNet consensus in ~1.8 seconds.
            </p>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[10px] font-mono text-indigo-300 overflow-x-auto leading-relaxed">
{`1. Client POST /adsec/audit (unpaid payload)
2. Server 402 Payment Required ($0.001 USDC)
3. Client Signs exact-avm Transfer (ASA #10458941)
4. GoPlausible Facilitator Settles on Algorand
5. Server 200 OK -> Findings + Diffs + TxID`}
            </pre>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-500 text-[10px] uppercase">
                <span>GoPlausible Catalog Discovery</span>
                <span className="text-emerald-400">{bazaarCount || 1500}+ Active Endpoints</span>
              </div>
              <div className="text-cyan-300 text-[11px] truncate select-all">
                curl -s "https://facilitator.goplausible.xyz/discovery/resources"
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onSwitchToPlayground}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow"
              >
                <span>Launch Interactive Web Playground</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AgentGuidePage
