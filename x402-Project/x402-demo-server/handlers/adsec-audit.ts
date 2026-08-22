import type { Context } from 'hono';
import * as crypto from 'crypto';
import { runAudit, AuditRequest } from '../engine';

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
 * GREEN CARD 1: Pre-Flight Deterministic Scanner ($0.01 USDC)
 */
export async function handleAdsecScanRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/scan] Payment Verified ($0.01 USDC)! Executing pre-flight scan...');
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
        paidAmount: '0.01 USDC',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ADSEC /adsec/scan] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

/**
 * GREEN CARD 2: Language-Aware Git Diff Patch Generator ($0.03 USDC)
 */
export async function handleAdsecRemediateRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/remediate] Payment Verified ($0.03 USDC)! Generating unified Git diffs...');
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
 * GREEN CARD 3: Cryptographic On-Chain Audit Attestation ($0.01 USDC)
 */
export async function handleAdsecAttestRequest(c: Context) {
  try {
    console.log('\n🟢 [ADSEC /adsec/attest] Payment Verified ($0.01 USDC)! Issuing on-chain attestation...');
    const reqBody = await parseAuditRequest(c, 'tier1');
    const auditResult = await runAudit({ ...reqBody, tier: 'tier1' });

    // Compute cryptographic SHA-256 hash of audited source code
    const codeHash = crypto.createHash('sha256').update(reqBody.code || '').digest('hex');
    const attestationProof = {
      codeHash,
      score: auditResult.summary.score,
      status: auditResult.summary.score >= 80 ? 'PASSED_PREFLIGHT' : 'REQUIRES_REMEDIATION',
      totalIssues: auditResult.summary.totalIssues,
      timestamp: new Date().toISOString(),
      attestationAuthority: 'ADSEC Security Node (Algorand TestNet)',
      txNoteSchema: `adsec:v1;sha256:${codeHash.slice(0, 16)};score:${auditResult.summary.score}`,
    };

    return c.json({
      success: true,
      endpoint: '/adsec/attest',
      greenCard: 'Green Card 3 (On-Chain Proof-of-Audit Attestation)',
      attestation: attestationProof,
      receipt: {
        network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
        paidAmount: '0.01 USDC',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ADSEC /adsec/attest] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}

/**
 * UNIFIED SUITE: Complete All-in-One Security Audit ($0.05 USDC)
 */
export async function handleAdsecAuditRequest(c: Context) {
  try {
    console.log('\n⚡ [ADSEC /adsec/audit] Payment Verified ($0.05 USDC)! Executing full security audit suite...');
    const reqBody = await parseAuditRequest(c, 'tier2');
    const auditResult = await runAudit(reqBody);

    const codeHash = crypto.createHash('sha256').update(reqBody.code || '').digest('hex');

    auditResult.receipt = {
      network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
      paidAmount: '0.05 USDC',
      codeHash,
      timestamp: new Date().toISOString(),
    };

    return c.json(auditResult);
  } catch (error) {
    console.error('❌ [ADSEC /adsec/audit] Error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
}
