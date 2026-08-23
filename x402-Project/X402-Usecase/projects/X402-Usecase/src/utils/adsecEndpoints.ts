export type EndpointMode = 'scan' | 'remediate' | 'attest' | 'audit'

export interface EndpointMeta {
  path: string
  name: string
  price: string
  priceValue: number
  cardBadge: string
  desc: string
  accent: string
}

export const ENDPOINTS_META: Record<EndpointMode, EndpointMeta> = {
  scan: {
    path: '/adsec/scan',
    name: 'Pre-Flight Scanner',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'GREEN CARD 01',
    desc: 'Fast deterministic check for leaked secrets, AST patterns, typosquatting & live OSV.dev CVEs.',
    accent: 'emerald',
  },
  remediate: {
    path: '/adsec/remediate',
    name: 'Auto-Remediation Node',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'GREEN CARD 02',
    desc: 'Generates language-aware unified Git diff patches (git apply ready) to fix code flaws.',
    accent: 'cyan',
  },
  attest: {
    path: '/adsec/attest',
    name: 'On-Chain Attestation',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'GREEN CARD 03',
    desc: 'Hashes code with SHA-256 and writes a cryptographic proof-of-audit certificate on Algorand TestNet.',
    accent: 'violet',
  },
  audit: {
    path: '/adsec/audit',
    name: 'Unified Audit Suite',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'FULL PIPELINE',
    desc: 'Complete all-in-one suite: Full Scan, Git Diff fixes, and On-Chain Attestation.',
    accent: 'indigo',
  },
}

export const ENDPOINT_ORDER: EndpointMode[] = ['scan', 'remediate', 'attest', 'audit']

export function setAdsecMode(mode: EndpointMode) {
  window.dispatchEvent(new CustomEvent('adsec:set-mode', { detail: mode }))
}
