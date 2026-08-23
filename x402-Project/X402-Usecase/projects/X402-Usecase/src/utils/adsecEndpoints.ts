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
    name: 'Vulnerability Scanner',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'STATIC SCAN',
    desc: 'Detects hardcoded secrets, injection vectors, and flagged dependencies with live OSV.dev CVE lookup.',
    accent: 'emerald',
  },
  remediate: {
    path: '/adsec/remediate',
    name: 'Automatic Patching',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'AUTO-PATCH',
    desc: 'Produces clean, language-aware unified git diffs ready to review and merge with `git apply`.',
    accent: 'cyan',
  },
  attest: {
    path: '/adsec/attest',
    name: 'On-Chain Proof',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'ATTESTATION',
    desc: 'Hashes your code with SHA-256 and writes a permanent proof-of-audit note to Algorand TestNet.',
    accent: 'violet',
  },
  audit: {
    path: '/adsec/audit',
    name: 'Full Audit Pipeline',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'FULL SUITE',
    desc: 'End-to-end security check: deep vulnerability scan, automated git diff patches, and on-chain attestation.',
    accent: 'indigo',
  },
}

export const ENDPOINT_ORDER: EndpointMode[] = ['scan', 'remediate', 'attest', 'audit']

export function setAdsecMode(mode: EndpointMode) {
  window.dispatchEvent(new CustomEvent('adsec:set-mode', { detail: mode }))
}
