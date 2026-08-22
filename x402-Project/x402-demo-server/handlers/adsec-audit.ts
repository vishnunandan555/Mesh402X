import type { Context } from 'hono';
import { runAudit, AuditRequest } from '../engine';

/**
 * ADSEC Code Security Audit Endpoint Handler
 * Protected by x402 payment middleware on Algorand TestNet
 */
export async function handleAdsecAuditRequest(c: Context) {
  try {
    console.log('\n🛡️ [ADSEC] Payment Verified! Executing security audit pipeline...');

    let reqBody: AuditRequest;
    try {
      reqBody = await c.req.json();
    } catch {
      // Default fallback demo snippet if no body provided
      reqBody = {
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
        tier: 'tier2',
        filename: 'auth.py',
      };
    }

    // Run core security engine
    const auditResult = await runAudit(reqBody);

    // Attach verified on-chain payment receipt metadata
    auditResult.receipt = {
      network: 'Algorand TestNet (CAIP-2: algorand:SGO1GKSzyE7IEPtTxCbyp9x0ZFi)',
      paidAmount: reqBody.tier === 'tier2' ? '0.05 USDC' : '0.01 USDC',
      timestamp: new Date().toISOString(),
    };

    console.log(`🛡️ [ADSEC] Audit Completed in ${auditResult.summary.durationMs}ms:`);
    console.log(`   - Score: ${auditResult.summary.score}/100`);
    console.log(`   - Total Issues: ${auditResult.summary.totalIssues} (${auditResult.summary.critical} Critical, ${auditResult.summary.high} High)`);

    return c.json(auditResult);
  } catch (error) {
    console.error('❌ [ADSEC] Audit Execution Error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to complete security audit',
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}
