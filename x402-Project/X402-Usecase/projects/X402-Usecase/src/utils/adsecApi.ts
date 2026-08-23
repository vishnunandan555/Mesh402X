import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch'
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm'
import type { ClientAvmSigner } from '@x402-avm/avm'
import { ExactAvmScheme } from '@x402-avm/avm/exact/client'

export interface AdsecAuditPayload {
  code: string
  language?: 'python' | 'javascript' | 'typescript' | 'solidity' | 'json' | 'text'
  tier?: 'tier1' | 'tier2'
  filename?: string
}

export interface AdsecFinding {
  id: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description?: string
  line?: number
  snippet?: string
  remediation?: string
  cweId?: string
}

export interface AdsecFix {
  findingId?: string
  filePath?: string
  diff: string
  explanation?: string
}

export interface AdsecResponse {
  success: boolean
  endpoint?: string
  greenCard?: string
  summary?: {
    totalIssues: number
    critical: number
    high: number
    medium: number
    low: number
    score: number
    durationMs: number
  }
  findings?: AdsecFinding[]
  fixes?: AdsecFix[]
  attestation?: {
    codeHash: string
    score: number
    status: string
    totalIssues: number
    timestamp: string
    txNoteSchema: string
    attestationAuthority?: string
    txId?: string
    loraUrl?: string
  }
  receipt?: {
    network?: string
    paidAmount?: string
    timestamp?: string
    txId?: string
    attestationTxId?: string
    loraUrl?: string
    codeHash?: string
  }
  error?: string
}

/**
 * Creates an x402-enabled fetch wrapper linked to the connected Algorand wallet
 */
export async function createAdsecX402Fetch(walletSigner: any) {
  const client = new x402Client()
  let originalTxns: Uint8Array[] = []

  const x402Signer: ClientAvmSigner = {
    address: walletSigner.address,
    signTransactions: async (txns: Uint8Array[]) => {
      originalTxns = txns
      const walletResult = await walletSigner.signTransactions(txns)

      if (Array.isArray(walletResult)) {
        return walletResult.map((item: any, i: number) => {
          if (item === null || item === undefined) return originalTxns[i]
          if (item instanceof Uint8Array) return item
          if (typeof item === 'string') {
            const binaryString = atob(item)
            const bytes = new Uint8Array(binaryString.length)
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j)
            }
            return bytes
          }
          return originalTxns[i]
        })
      }
      return walletResult
    },
  }

  client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(x402Signer))
  client.register('algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', new ExactAvmScheme(x402Signer))
  return wrapFetchWithPayment(fetch, client)
}

/**
 * Executes a paid security audit request via x402 on Algorand TestNet
 */
export async function executeAdsecRequestWithPayment(
  endpointUrl: string,
  payload: AdsecAuditPayload,
  walletSigner: any,
  onStepChange?: (step: 'challenging' | 'signing' | 'settling' | 'done') => void
): Promise<AdsecResponse> {
  onStepChange?.('challenging')

  const fetchFn = await createAdsecX402Fetch(walletSigner)
  onStepChange?.('signing')

  const res = await fetchFn(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  onStepChange?.('settling')

  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`)
  }

  const data: AdsecResponse = await res.json()
  onStepChange?.('done')
  return data
}
