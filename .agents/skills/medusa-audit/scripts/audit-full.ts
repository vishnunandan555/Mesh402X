import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import algosdk from 'algosdk';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

/**
 * MEDUSA TIER: FULL ALL-IN-ONE AUDIT SUITE
 * Endpoint: POST /adsec/audit
 * Price: $0.001 USDC (1,000 microUSDC)
 * Features: AST pattern checks, secret leaks, live OSV.dev CVE scan, AI deep review, unified git diffs, on-chain attestation.
 */
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`❌ Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-full.ts <path_to_source_file>`);
    process.exit(1);
  }

  const mnemonic = process.env.AGENT_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.PAYER_MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Error: Missing AGENT_MNEMONIC in .env');
    console.log('Please add your 25-word Algorand TestNet mnemonic to .env');
    process.exit(1);
  }

  const backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/audit`;

  console.log(`\n======================================================`);
  console.log(`🤖 MEDUSA [FULL AUDIT SUITE]: ${targetFile}`);
  console.log(`======================================================`);
  console.log(`💰 Price : $0.001 USDC (Algorand TestNet ASA #10458941)`);
  console.log(`🎯 Target: ${endpointUrl}`);

  // 1. Load Account
  const agentAccount = algosdk.mnemonicToSecretKey(mnemonic);
  console.log(`💳 Wallet: ${agentAccount.addr}`);

  // 2. Setup x402 Client
  const client = new x402Client();
  client.register('algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', new ExactAvmScheme({
    address: agentAccount.addr.toString(),
    signTransactions: async (txns) => txns.map(t => algosdk.signTransaction(algosdk.decodeUnsignedTransaction(t), agentAccount.sk).blob)
  }));
  const payingFetch = wrapFetchWithPayment(fetch, client);

  // 3. Read Code & Send
  const code = fs.readFileSync(targetFile, 'utf-8');
  let language = 'python';
  if (targetFile.endsWith('.js')) language = 'javascript';
  else if (targetFile.endsWith('.ts') || targetFile.endsWith('.tsx')) language = 'typescript';
  else if (targetFile.endsWith('.sol')) language = 'solidity';

  console.log(`⚡ Sending code to Medusa & settling $0.001 USDC via x402...`);
  const startTime = Date.now();

  const res = await payingFetch(endpointUrl, {
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
    console.error(`❌ Audit Failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const report = await res.json();

  // 4. Output Results
  console.log(`\n=================== AUDIT RESULTS (${duration}ms) ===================`);
  console.log(`🛡️  Security Health Score : ${report.summary?.score ?? 'N/A'}/100`);
  console.log(`🚨 Total Issues Found    : ${report.summary?.totalIssues || 0} (Critical: ${report.summary?.critical || 0}, High: ${report.summary?.high || 0})`);

  // Financial Payment Echo
  console.log(`\n💸 FINANCIAL CONFIRMATION:`);
  console.log(`   • Paid to Node   : $0.001 USDC (1,000 microUSDC)`);
  console.log(`   • Receiver Node  : LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`);
  console.log(`   • Network Scheme : x402 ExactAvmScheme (Algorand TestNet ASA #10458941)`);
  if (report.attestation?.txId || report.receipt?.txId) {
    console.log(`   • Settlement Tx  : ${report.attestation?.txId || report.receipt?.txId}`);
  }

  if (report.findings && report.findings.length > 0) {
    console.log(`\n📋 Detected Vulnerabilities:`);
    report.findings.forEach((f: any, idx: number) => {
      console.log(`  ${idx + 1}. [${(f.severity || 'high').toUpperCase()}] ${f.title}`);
      if (f.line) console.log(`     Location : Line ${f.line}`);
      if (f.cweId) console.log(`     CWE ID   : ${f.cweId}`);
      if (f.snippet) console.log(`     Snippet  : ${f.snippet.trim()}`);
      if (f.remediation) console.log(`     Fix Tip  : ${f.remediation}`);
    });
  }

  // Write Git Diff Fixes
  if (report.fixes && report.fixes.length > 0) {
    const patchPath = 'audit.patch';
    let patchContent = '';
    report.fixes.forEach((fx: any) => {
      patchContent += `${fx.diff}\n\n`;
    });
    fs.writeFileSync(patchPath, patchContent);
    console.log(`\n🩹 Unified Git Diff Patch saved to: '${patchPath}'`);
    console.log(`   Apply automatically with: git apply ${patchPath}`);
  }

  // On-Chain Attestation
  const txId = report.attestation?.txId || report.receipt?.txId;
  if (txId) {
    console.log(`\n⛓️  On-Chain Attestation TxID : ${txId}`);
    console.log(`🔗 Lora Explorer Verification : https://lora.algokit.io/testnet/transaction/${txId}`);
  }
  console.log(`=========================================================\n`);
}

main().catch(console.error);
