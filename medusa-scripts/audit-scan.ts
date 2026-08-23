import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import algosdk from 'algosdk';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

/**
 * MEDUSA TIER: PRE-FLIGHT DETERMINISTIC SCANNER
 * Endpoint: POST /adsec/scan
 * Price: $0.001 USDC (1,000 microUSDC)
 * Features: Static AST syntax hazards, leaked secret entropy, typosquatting packages, and live OSV.dev CVEs.
 */
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`[!] Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-scan.ts <path_to_source_file>`);
    process.exit(1);
  }

  const rawMnemonic = process.env.AGENT_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.PAYER_MNEMONIC;
  const mnemonic = rawMnemonic
    ? rawMnemonic
        .trim()
        .replace(/^[A-Za-z0-9_]+\s*=\s*/, '')
        .replace(/^["'\\]+|["'\\]+$/g, '')
        .replace(/^["'\\]+|["'\\]+$/g, '')
        .trim()
        .replace(/\s+/g, ' ')
    : '';

  if (!mnemonic) {
    console.error('[!] Error: Missing AGENT_MNEMONIC in wallet.env or .env');
    process.exit(1);
  }

  const backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/scan`;

  console.log(`\n======================================================`);
  console.log(`[+] MEDUSA [PRE-FLIGHT SCANNER]: ${targetFile}`);
  console.log(`======================================================`);
  console.log(`Price : $0.001 USDC (Algorand TestNet ASA #10458941)`);
  console.log(`Target: ${endpointUrl}`);

  const agentAccount = algosdk.mnemonicToSecretKey(mnemonic);
  console.log(`Wallet: ${agentAccount.addr}`);

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

  console.log(`[*] Sending code to Medusa scan endpoint...`);
  const startTime = Date.now();

  const res = await payingFetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      filename: targetFile,
      language
    })
  });

  const duration = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`[!] Scan Failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const report = await res.json();

  console.log(`\n=================== SCAN RESULTS (${duration}ms) ===================`);
  console.log(`Security Score       : ${report.summary?.score ?? 'N/A'}/100`);
  console.log(`Total Issues Found   : ${report.summary?.totalIssues || 0}`);

  // Financial Payment Echo
  console.log(`\n[FINANCIAL CONFIRMATION]`);
  console.log(`   * Paid to Node   : $0.001 USDC (1,000 microUSDC)`);
  console.log(`   * Receiver Node  : LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`);
  console.log(`   * Network Scheme : x402 ExactAvmScheme (Algorand TestNet ASA #10458941)`);

  if (report.findings && report.findings.length > 0) {
    console.log(`\nDetected Vulnerabilities:`);
    report.findings.forEach((f: any, idx: number) => {
      console.log(`  ${idx + 1}. [${(f.severity || 'high').toUpperCase()}] ${f.title}`);
      if (f.line) console.log(`     Location : Line ${f.line}`);
      if (f.cweId) console.log(`     CWE ID   : ${f.cweId}`);
      if (f.snippet) console.log(`     Snippet  : ${f.snippet.trim()}`);
    });
  }
  console.log(`=========================================================\n`);
}

main().catch(console.error);
