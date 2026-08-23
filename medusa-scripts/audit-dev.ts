import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * MEDUSA TIER: FREE DEV TEST AUDIT
 * Endpoint: POST /adsec/dev-audit
 * Price: $0.00 (100% Free Public Endpoint)
 * Features: Zero-token rapid testing of the security scoring engine, AST rules, and diff generator.
 */
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`❌ Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-dev.ts <path_to_source_file>`);
    process.exit(1);
  }

  const backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/dev-audit`;

  console.log(`\n======================================================`);
  console.log(`🟢 MEDUSA [FREE DEV TEST AUDIT]: ${targetFile}`);
  console.log(`======================================================`);
  console.log(`💰 Price : $0.00 (No Wallet / Tokens Required)`);
  console.log(`🎯 Target: ${endpointUrl}`);

  const code = fs.readFileSync(targetFile, 'utf-8');
  let language = 'python';
  if (targetFile.endsWith('.js')) language = 'javascript';
  else if (targetFile.endsWith('.ts') || targetFile.endsWith('.tsx')) language = 'typescript';
  else if (targetFile.endsWith('.sol')) language = 'solidity';

  console.log(`⚡ Sending code to Medusa free dev endpoint...`);
  const startTime = Date.now();

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      filename: targetFile,
      language,
      tier: 'tier2'
    })
  });

  const duration = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`❌ Dev Audit Failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const report = await res.json();

  console.log(`\n=================== DEV AUDIT RESULTS (${duration}ms) ===================`);
  console.log(`🛡️  Security Health Score : ${report.summary?.score ?? 'N/A'}/100`);
  console.log(`🚨 Total Issues Found    : ${report.summary?.totalIssues || 0}`);

  if (report.findings && report.findings.length > 0) {
    console.log(`\n📋 Detected Vulnerabilities:`);
    report.findings.forEach((f: any, idx: number) => {
      console.log(`  ${idx + 1}. [${(f.severity || 'high').toUpperCase()}] ${f.title}`);
      if (f.line) console.log(`     Location : Line ${f.line}`);
      if (f.cweId) console.log(`     CWE ID   : ${f.cweId}`);
      if (f.snippet) console.log(`     Snippet  : ${f.snippet.trim()}`);
    });
  }

  if (report.fixes && report.fixes.length > 0) {
    const patchPath = 'audit.patch';
    let patchContent = '';
    report.fixes.forEach((fx: any) => {
      patchContent += `${fx.diff}\n\n`;
    });
    fs.writeFileSync(patchPath, patchContent);
    console.log(`\n🩹 Unified Git Diff saved to: '${patchPath}'`);
    console.log(`   Apply automatically with: git apply ${patchPath}`);
  }
  console.log(`=========================================================\n`);
}

main().catch(console.error);
