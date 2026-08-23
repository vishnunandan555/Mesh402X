import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import algosdk from 'algosdk';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

/**
 * MEDUSA TIER: ON-CHAIN CRYPTOGRAPHIC ATTESTATION
 * Endpoint: POST /adsec/attest
 * Price: $0.001 USDC (1,000 microUSDC)
 * Features: Computes SHA-256 code digest & broadcasts immutable on-chain proof-of-audit certificate to Algorand TestNet.
 */
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`[!] Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-attest.ts <path_to_source_file>`);
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
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/attest`;

  console.log(`\n======================================================`);
  console.log(`[+] MEDUSA [ON-CHAIN ATTESTATION]: ${targetFile}`);
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

  console.log(`[*] Submitting code for on-chain SHA-256 attestation note...`);
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
    console.error(`[!] Attestation Failed (${res.status}): ${errText}`);
    process.exit(1);
  }

  const report = await res.json();

  console.log(`\n=================== ATTESTATION RESULTS (${duration}ms) ===================`);
  // Financial Payment Echo
  console.log(`\n[FINANCIAL CONFIRMATION]`);
  console.log(`   * Paid to Node   : $0.001 USDC (1,000 microUSDC)`);
  console.log(`   * Receiver Node  : LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ`);
  console.log(`   * Network Scheme : x402 ExactAvmScheme (Algorand TestNet ASA #10458941)`);
  if (report.attestation) {
    console.log(`Cryptographic SHA-256 Code Hash : ${report.attestation.codeHash}`);
    console.log(`Audited Security Score         : ${report.attestation.score}/100`);
    console.log(`On-Chain Transaction ID        : ${report.attestation.txId}`);
    console.log(`Lora Explorer Link             : https://lora.algokit.io/testnet/transaction/${report.attestation.txId}`);
  }
  console.log(`=========================================================\n`);
}

main().catch(console.error);
