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
    cardBadge: 'FIND ISSUES',
    desc: 'Scans your code for leaked passwords, API keys, unsafe commands and known CVEs — then shows you exactly where each problem is.',
    accent: 'emerald',
  },
  remediate: {
    path: '/adsec/remediate',
    name: 'Automatic Patching',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'GET FIXES',
    desc: 'Writes the fix for every issue it finds and hands you a ready-to-apply git patch — review it, apply it, done.',
    accent: 'cyan',
  },
  attest: {
    path: '/adsec/attest',
    name: 'On-Chain Proof',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'PROVE IT',
    desc: 'Takes a SHA-256 fingerprint of your code and writes a permanent proof-of-audit receipt to the Algorand blockchain, verifiable by anyone.',
    accent: 'violet',
  },
  audit: {
    path: '/adsec/audit',
    name: 'Full Audit Pipeline',
    price: '$0.001 USDC',
    priceValue: 0.001,
    cardBadge: 'MOST COMPLETE',
    desc: 'Everything in one run: deep vulnerability scan, automatic fix patches, and an on-chain proof certificate.',
    accent: 'indigo',
  },
}

export const ENDPOINT_ORDER: EndpointMode[] = ['scan', 'remediate', 'attest', 'audit']

export function setAdsecMode(mode: EndpointMode) {
  window.dispatchEvent(new CustomEvent('adsec:set-mode', { detail: mode }))
}
