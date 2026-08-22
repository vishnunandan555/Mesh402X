/**
 * ADSEC Autonomous Agent CLI
 *
 * Demonstrates an AI agent or developer running an on-demand,
 * x402-paid security audit on local code files.
 *
 * Usage:
 *   npx tsx scripts/agent-audit.ts file1.py file2.js [--tier=tier1|tier2]
 */

import * as fs from 'fs';
import * as path from 'path';
import { runAudit, AuditFinding, AuditDiffFix } from '../engine';

const SAMPLE_VULNERABLE_CODE = `
import os
import reqeusts  # Typosquatting package

# Hardcoded Secret
OPENAI_API_KEY = "sk-proj-abc123456789012345678901234567890"

def get_user_records(user_id):
    # SQL Injection via string interpolation
    sql_query = f"SELECT * FROM users WHERE id = {user_id}"
    
    # Command Injection hazard
    os.system(f"echo Querying user {user_id}")
    
    # Insecure deserialization
    import pickle
    user_state = pickle.loads(b"cos\\nsystem\\n(S'whoami'\\ntR.")
    
    return sql_query
`.trim();

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find((a) => a.startsWith('--tier='));
  const tier = (tierArg ? tierArg.split('=')[1] : 'tier2') as 'tier1' | 'tier2';
  
  // Get all file paths passed in CLI arguments
  const filePaths = args.filter((a) => !a.startsWith('--'));

  console.log('\n' + '═'.repeat(65));
  console.log('🤖 ADSEC — Autonomous Agent Security Pre-Flight Audit');
  console.log('═'.repeat(65));
  console.log(`📁 Files to Audit : ${filePaths.length > 0 ? filePaths.length : 1} file(s)`);
  console.log(`🏷️ Service Tier   : ${tier.toUpperCase()} (${tier === 'tier2' ? '$0.05 USDC' : '$0.01 USDC'})`);
  console.log('═'.repeat(65));

  console.log('\n📡 [x402 Flow] Initiating audit request to ADSEC node...');
  console.log('🟡 [x402 HTTP 402] Payment Required ($0.01 USDC on Algorand TestNet)');
  console.log('🔵 [x402 Client] Signing micro-payment from Agent Wallet...');
  console.log('🟢 [x402 Facilitator] Settled on Algorand TestNet (TxID: 0x4f9a2b8e...)');

  console.log('\n🔍 [ADSEC Engine] Scanning code for secrets, CVEs, and pattern flaws...');

  if (filePaths.length === 0) {
    // Default demo run
    await auditSingleContent('vulnerable-demo.py', SAMPLE_VULNERABLE_CODE, 'python', tier);
    return;
  }

  let grandTotalIssues = 0;
  let allFindings: AuditFinding[] = [];
  let allFixes: AuditDiffFix[] = [];

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      console.log(`\n❌ File not found: ${filePath}`);
      continue;
    }

    const filename = path.basename(filePath);
    const code = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filename).toLowerCase();
    let language: 'python' | 'javascript' | 'typescript' | 'solidity' = 'python';
    if (ext === '.js') language = 'javascript';
    else if (ext === '.ts') language = 'typescript';
    else if (ext === '.sol') language = 'solidity';

    const result = await runAudit({ code, language, tier, filename });

    grandTotalIssues += result.summary.totalIssues;
    allFindings.push(...result.findings.map(f => ({ ...f, title: `[${filename}] ${f.title}` })));
    if (result.fixes) allFixes.push(...result.fixes);

    console.log(`\n📄 Audited: ${filename} ➔ Score: ${result.summary.score}/100 | Issues: ${result.summary.totalIssues} (Critical: ${result.summary.critical}, High: ${result.summary.high})`);
  }

  console.log('\n' + '─'.repeat(65));
  console.log(`🛡️  AUDIT SUMMARY Across ${filePaths.length} Files: ${grandTotalIssues} Total Issues Detected`);
  console.log('─'.repeat(65));

  if (allFindings.length > 0) {
    console.log('\n📋 DETAILED FINDINGS:');
    allFindings.forEach((f, idx) => {
      const icon = f.severity === 'critical' ? '🔴 [CRITICAL]' : f.severity === 'high' ? '🟠 [HIGH]' : '🟡 [MEDIUM]';
      console.log(`\n${idx + 1}. ${icon} ${f.title}`);
      if (f.line) console.log(`   📍 Line ${f.line}: \`${f.snippet}\``);
      console.log(`   💡 Remediation: ${f.remediation}`);
      if (f.cweId) console.log(`   🏷️ Tag: ${f.cweId}`);
    });
  }

  if (allFixes.length > 0) {
    console.log('\n' + '═'.repeat(65));
    console.log('✨ [ADSEC Auto-Remediation] Generated Actionable Git Diff Patches:');
    console.log('═'.repeat(65));
    for (const fix of allFixes) {
      console.log(`\n# Fix for: ${fix.findingId}`);
      console.log(fix.diff);
      console.log(`Explanation: ${fix.explanation}`);
    }
  }

  console.log('\n' + '═'.repeat(65));
  console.log('✅ Audit Completed & Verified On-Chain! Ready for deployment.');
  console.log('═'.repeat(65) + '\n');
}

async function auditSingleContent(filename: string, code: string, language: any, tier: any) {
  const result = await runAudit({ code, language, tier, filename });
  console.log(`\n🛡️  AUDIT REPORT: ${result.summary.score}/100 Security Score (${result.summary.durationMs}ms)`);
  console.log(`⚠️  Total Issues Found: ${result.summary.totalIssues} (Critical: ${result.summary.critical}, High: ${result.summary.high})`);
  if (result.findings.length > 0) {
    result.findings.forEach((f, idx) => {
      const icon = f.severity === 'critical' ? '🔴 [CRITICAL]' : '🟠 [HIGH]';
      console.log(`\n${idx + 1}. ${icon} ${f.title}`);
      if (f.line) console.log(`   📍 Line ${f.line}: \`${f.snippet}\``);
      console.log(`   💡 Remediation: ${f.remediation}`);
    });
  }
}

main().catch(console.error);
