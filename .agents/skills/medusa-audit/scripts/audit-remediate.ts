import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import algosdk from 'algosdk';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

/**
 * MEDUSA TIER: GIT DIFF AUTO-REMEDIATION GENERATOR
 * Endpoint: POST /adsec/remediate
 * Price: $0.001 USDC (1,000 microUSDC)
 * Features: Generates language-aware unified Git diff patches fixing identified security vulnerabilities (git apply ready).
 */
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`❌ Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-remediate.ts <path_to_source_file>`);
    process.exit(1);
  }

  const mnemonic = process.env.AGENT_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.PAYER_MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Error: Missing AGENT_MNEMONIC in .env');
    process.exit(1);
  }

  const backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/remediate`;

  console.log(`\n======================================================`);
  console.log(`🩹 MEDUSA [AUTO-REMEDIATION DIFF GENERATOR]: ${targetFile}`);
  console.log(`======================================================`);
  console.log(`💰 Price : $0.001 USDC (Algorand TestNet ASA #10458941)`);
  console.log(`🎯 Target: ${endpointUrl}`);

  const agentAccount = algosdk.mnemonicToSecretKey(mnemonic);
  console.log(`💳 Wallet: ${agentAccount.addr}`);

  const client = new x402Client();
  client.register('algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', new ExactAvmScheme({
    address: agentAccount.addr.toString(),
    signTransactions: async (txns) => txns.map(t => algosdk.signTransaction(algosdk.decodeUnsignedTransaction(t), agentAccount.sk).blob)
  }));
  const payingFetch = wrapFetchWithPayment(fetch, client);

  const code = fs.readFileSync(targetFile, 'utf-8');
  let language = 'python';
  if (targetFile.endsWith('.js')) language = 'javascript';
  else if (targetFile.endsWith('.ts') || targetFile.endsWith('.tsx')) language = 'typescript';
  else if (targetFile.endsWith('.sol')) language = 'solidity';

  console.log(`⚡ Requesting Git diff patches & settling $0.001 USDC via x402...`);
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
    console.error(`❌ Remediation Failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const report = await res.json();

  console.log(`\n=================== REMEDIATION RESULTS (${duration}ms) ===================`);
  if (report.fixes && report.fixes.length > 0) {
    const patchPath = 'audit.patch';
    let patchContent = '';
    report.fixes.forEach((fx: any, idx: number) => {
      console.log(`\n# Fix #${idx + 1}:`);
      console.log(fx.diff);
      patchContent += `${fx.diff}\n\n`;
    });
    fs.writeFileSync(patchPath, patchContent);
    console.log(`\n🩹 Unified Git Diff saved to: '${patchPath}'`);
    console.log(`   Apply automatically with: git apply ${patchPath}`);
  } else {
    console.log(`\n✅ No fixes needed! Code appears cleanly hardened.`);
  }
  console.log(`=========================================================\n`);
}

main().catch(console.error);
