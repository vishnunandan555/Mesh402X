import type { Context } from 'hono';
import * as crypto from 'crypto';
import algosdk from 'algosdk';
import { runAudit, AuditRequest } from '../engine';

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';

/**
 * Broadcasts a real cryptographic Proof-of-Audit note to Algorand TestNet
 */
async function broadcastOnChainAttestation(
  codeHash: string,
  score: number,
  filename?: string
): Promise<{ txId?: string; loraUrl?: string }> {
  const mnemonic = process.env.ATTESTATION_MNEMONIC || process.env.SERVER_MNEMONIC || process.env.PAYER_MNEMONIC;
  if (!mnemonic) {
    return {};
  }

  try {
    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const suggestedParams = await algodClient.getTransactionParams().do();

    const noteString = `adsec:v1;sha256:${codeHash.slice(0, 32)};score:${score};file:${filename || 'audit'}`;
    const note = new Uint8Array(Buffer.from(noteString));

    // 0-ALGO self-transaction carrying the cryptographic attestation note
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: account.addr,
      amount: 0,
      note,
      suggestedParams,
    });

    const signedTxn = txn.signTxn(account.sk);
    const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = sendResult.txid || txn.txID();

    console.log(`⛓️ [ADSEC On-Chain Attestation] Broadcasted to Algorand TestNet: ${txId}`);
    return {
      txId,
      loraUrl: `https://lora.algokit.io/testnet/transaction/${txId}`,
    };
  } catch (err: any) {
    console.warn(`⚠️ [ADSEC On-Chain Attestation] Notice: ${err?.message || 'Could not broadcast on-chain note'}`);
    return {};
  }
}

/**
 * Helper to parse request body with fallback
 */
async function parseAuditRequest(c: Context, defaultTier: 'tier1' | 'tier2' = 'tier1'): Promise<AuditRequest> {
  try {
    const body = await c.req.json();
    return {
      tier: defaultTier,
      ...body,
    };
  } catch {
    return {
      code: `
import os
import reqeusts

OPENAI_KEY = "sk-proj-abc1234567890123456789012345"

def login_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    os.system(f"echo User logged in: {user_id}")
    return query
      `.trim(),
      language: 'python',
      tier: defaultTier,
      filename: 'auth.py',
    };
  }
}

/**
 * GREEN CARD 1: Pre-Flight Deterministic Scanner ($0.001 USDC)
 */
export async function handleAdsecScanRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/scan] Payment Verified ($0.001 USDC)! Executing pre-flight scan...');
    const reqBody = await parseAuditRequest(c, 'tier1');
    const auditResult = await runAudit({ ...reqBody, tier: 'tier1' });

    return c.json({
      success: true,
      endpoint: '/adsec/scan',
      greenCard: 'Green Card 1 (Pre-Flight Scanner)',
      summary: auditResult.summary,
      findings: auditResult.findings,
      receipt: {
        network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
        paidAmount: '$0.001 USDC',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ADSEC /adsec/scan] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

/**
 * GREEN CARD 2: Language-Aware Git Diff Patch Generator ($0.001 USDC)
 */
export async function handleAdsecRemediateRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/remediate] Payment Verified ($0.001 USDC)! Generating unified Git diffs...');
    const reqBody = await parseAuditRequest(c, 'tier2');
    const auditResult = await runAudit({ ...reqBody, tier: 'tier2' });

    return c.json({
      success: true,
      endpoint: '/adsec/remediate',
      greenCard: 'Green Card 2 (Auto-Remediation Patch Generator)',
      fixes: auditResult.fixes || [],
      remediatedIssuesCount: (auditResult.fixes || []).length,
      receipt: {
        network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
        paidAmount: '0.03 USDC',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ADSEC /adsec/remediate] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

/**
 * GREEN CARD 3: Cryptographic On-Chain Audit Attestation ($0.001 USDC)
 */
export async function handleAdsecAttestRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/attest] Payment Verified ($0.001 USDC)! Issuing on-chain attestation...');
    const reqBody = await parseAuditRequest(c, 'tier1');
    const auditResult = await runAudit({ ...reqBody, tier: 'tier1' });

    // Compute cryptographic SHA-256 hash of audited source code
    const codeHash = crypto.createHash('sha256').update(reqBody.code || '').digest('hex');

    // Broadcast real on-chain note transaction to Algorand TestNet if wallet configured
    const onChainResult = await broadcastOnChainAttestation(codeHash, auditResult.summary.score, reqBody.filename);

    const attestationProof = {
      codeHash,
      score: auditResult.summary.score,
      status: auditResult.summary.score >= 80 ? 'PASSED_PREFLIGHT' : 'REQUIRES_REMEDIATION',
      totalIssues: auditResult.summary.totalIssues,
      timestamp: new Date().toISOString(),
      attestationAuthority: 'ADSEC Security Node (Algorand TestNet)',
      txNoteSchema: `adsec:v1;sha256:${codeHash.slice(0, 16)};score:${auditResult.summary.score}`,
      txId: onChainResult.txId,
      loraUrl: onChainResult.loraUrl,
    };

    return c.json({
      success: true,
      endpoint: '/adsec/attest',
      greenCard: 'Green Card 3 (On-Chain Proof-of-Audit Attestation)',
      attestation: attestationProof,
      receipt: {
        network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
        paidAmount: '$0.001 USDC',
        timestamp: new Date().toISOString(),
        attestationTxId: onChainResult.txId,
        loraUrl: onChainResult.loraUrl,
      },
    });
  } catch (error) {
    console.error('❌ [ADSEC /adsec/attest] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

/**
 * UNIFIED SUITE: Complete All-in-One Security Audit ($0.001 USDC)
 */
export async function handleAdsecAuditRequest(c: Context) {
  try {
    console.log('\n⚡ [ADSEC /adsec/audit] Payment Verified ($0.001 USDC)! Executing full security audit suite...');
    const reqBody = await parseAuditRequest(c, 'tier2');
    const auditResult = await runAudit(reqBody);

    const codeHash = crypto.createHash('sha256').update(reqBody.code || '').digest('hex');
    const onChainResult = await broadcastOnChainAttestation(codeHash, auditResult.summary.score, reqBody.filename);

    auditResult.attestation = {
      codeHash,
      score: auditResult.summary.score,
      status: auditResult.summary.score >= 80 ? 'PASSED_PREFLIGHT' : 'REQUIRES_REMEDIATION',
      totalIssues: auditResult.summary.totalIssues,
      timestamp: new Date().toISOString(),
      attestationAuthority: 'ADSEC Security Node (Algorand TestNet)',
      txNoteSchema: `adsec:v1;sha256:${codeHash.slice(0, 16)};score:${auditResult.summary.score}`,
      txId: onChainResult.txId,
      loraUrl: onChainResult.loraUrl,
    };

    auditResult.receipt = {
      network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
      paidAmount: '$0.001 USDC',
      codeHash,
      timestamp: new Date().toISOString(),
      attestationTxId: onChainResult.txId,
      loraUrl: onChainResult.loraUrl,
    };

    return c.json(auditResult);
  } catch (error) {
    console.error('❌ [ADSEC /adsec/audit] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

