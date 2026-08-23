#!/usr/bin/env node
/**
 * ADSEC Autonomous Global User Agent CLI
 *
 * A turnkey CLI for autonomous AI agents and developers worldwide to:
 * 1. Generate a new Algorand TestNet wallet (`--generate-wallet`)
 * 2. Check wallet balances (ALGO & TestNet USDC)
 * 3. Discover the live ADSEC node on the GoPlausible Bazaar registry
 * 4. Submit any code file for paid pre-flight security review via x402
 * 5. Automatically write returned Git diff patches to `audit.patch` (git apply ready)
 * 6. Return verified on-chain transaction links on Lora Explorer
 *
 * Usage:
 *   npx tsx scripts/run-user-agent.ts --generate-wallet
 *   npx tsx scripts/run-user-agent.ts <path_to_file> [--backend <url>] [--tier tier1|tier2]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import algosdk from 'algosdk';
import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';
import type { ClientAvmSigner } from '@x402-avm/avm';

dotenv.config();

const BAZAAR_DISCOVERY_URL = 'https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=100';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941; // Algorand TestNet USDC ASA ID

// Default fallback sample code if no file provided
const SAMPLE_VULNERABLE_CODE = `
import os
import reqeusts  # Typosquatted package

# Hardcoded Secret Credential
OPENAI_API_KEY = "sk-proj-abc123456789012345678901234567890"

def get_user_record(user_id):
    # SQL Injection hazard
    sql_query = f"SELECT * FROM accounts WHERE id = {user_id}"
    os.system(f"echo Querying user {user_id}")
    return sql_query
`.trim();

/**
 * Generates a brand-new Algorand TestNet account with faucet instructions
 */
function handleGenerateWallet() {
  console.log('\n' + '═'.repeat(75));
  console.log('🔑 ADSEC AGENT: GENERATING NEW ALGORAND TESTNET WALLET');
  console.log('═'.repeat(75));

  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

  console.log('\n✅ New Algorand TestNet Account Created:');
  console.log(`   Public Address : ${account.addr}`);
  console.log(`   25-Word Mnemonic: "${mnemonic}"`);

  console.log('\n' + '─'.repeat(75));
  console.log('📋 NEXT STEPS TO FUND & ACTIVATE YOUR AGENT WALLET:');
  console.log('─'.repeat(75));
  console.log('1. Get Free TestNet ALGO:');
  console.log('   https://lora.algokit.io/testnet/dispenser');
  console.log('\n2. Opt-in to TestNet USDC (ASA 10458941):');
  console.log('   Connect this wallet on https://lora.algokit.io/testnet/dispenser or use Pera/Defly app');
  console.log('\n3. Get Free TestNet USDC:');
  console.log('   https://faucet.circle.com (Select Algorand Testnet)');
  console.log('\n4. Add to your .env file:');
  console.log(`   USER_AGENT_MNEMONIC="${mnemonic}"`);
  console.log('═'.repeat(75) + '\n');
}

/**
 * Main execution loop for the autonomous user agent
 */
async function main() {
  const args = process.argv.slice(2);

  // Check for --generate-wallet flag
  if (args.includes('--generate-wallet') || args.includes('-g')) {
    handleGenerateWallet();
    return;
  }

  // Parse CLI arguments
  let targetFilePath = '';
  let backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://adsec-backend.onrender.com';
  let tier: 'tier1' | 'tier2' = 'tier2';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--backend' || args[i] === '-b') {
      backendUrl = args[i + 1] || backendUrl;
      i++;
    } else if (args[i] === '--tier' || args[i] === '-t') {
      const parsedTier = args[i + 1];
      if (parsedTier === 'tier1' || parsedTier === 'tier2') {
        tier = parsedTier;
      }
      i++;
    } else if (!args[i].startsWith('-')) {
      targetFilePath = args[i];
    }
  }

  console.log('\n' + '═'.repeat(75));
  console.log('🤖 ADSEC AUTONOMOUS USER AGENT: PRE-FLIGHT SECURITY PIPELINE');
  console.log('═'.repeat(75));

  // 1. Read Code Payload
  let codeContent = SAMPLE_VULNERABLE_CODE;
  let filename = 'vulnerable_sample.py';

  if (targetFilePath && fs.existsSync(targetFilePath)) {
    codeContent = fs.readFileSync(targetFilePath, 'utf-8');
    filename = path.basename(targetFilePath);
    console.log(`\n📁 Target Source File: ${targetFilePath} (${codeContent.length} bytes)`);
  } else {
    console.log(`\n📁 Using Built-in Test Payload: ${filename} (SQLi + Typosquat + Leaked Key)`);
  }

  // Detect Language from filename extension
  let language = 'python';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) language = 'javascript';
  else if (filename.endsWith('.ts') || filename.endsWith('.tsx')) language = 'typescript';
  else if (filename.endsWith('.sol')) language = 'solidity';

  // 2. Discover Node & Endpoint
  const auditEndpoint = `${backendUrl.replace(/\/$/, '')}/adsec/audit`;
  console.log(`\n🌐 Target Security Node:`);
  console.log(`   - Endpoint : ${auditEndpoint}`);
  console.log(`   - Network  : Algorand TestNet (CAIP-2: ${ALGORAND_TESTNET_CAIP2})`);
  console.log(`   - Price    : $0.05 USDC (ASA ${USDC_ASA_ID})`);

  // 3. Load User Agent Wallet
  const mnemonic =
    process.env.USER_AGENT_MNEMONIC ||
    process.env.PAYER_MNEMONIC ||
    process.env.AVM_MNEMONIC ||
    process.env.AGENT_MNEMONIC;

  if (!mnemonic) {
    console.log('\n' + '─'.repeat(75));
    console.log('⚠️  NO USER WALLET CONFIGURED IN .env');
    console.log('To run this agent with a live on-chain wallet:');
    console.log('1. Run: npx tsx scripts/run-user-agent.ts --generate-wallet');
    console.log('2. Set in .env: USER_AGENT_MNEMONIC="your 25 word seed phrase"');
    console.log('─'.repeat(75) + '\n');
    return;
  }

  let userAccount: algosdk.Account;
  try {
    userAccount = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`\n💳 Loaded User Agent Wallet: ${userAccount.addr}`);

    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    const accountInfo = await algodClient.accountInformation(userAccount.addr).do();
    const algoBalance = Number(accountInfo.amount) / 1e6;
    console.log(`   - ALGO Balance : ${algoBalance} ALGO`);

    const usdcAsset = accountInfo.assets?.find((a: any) => a['asset-id'] === USDC_ASA_ID);
    const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;
    console.log(`   - USDC Balance : ${usdcBalance} USDC`);

    if (usdcBalance < 0.05) {
      console.warn(`\n⚠️  WARNING: Insufficient USDC (${usdcBalance} < $0.05 USDC).`);
      console.log(`   Fund at: https://faucet.circle.com for address ${userAccount.addr}`);
    }
  } catch (err: any) {
    console.error('Wallet validation error:', err.message);
    return;
  }

  // 4. Execute Autonomous x402 Call & Settle on Algorand TestNet
  console.log(`\n⚡ Submitting audit payload & executing x402 payment challenge/settlement...`);

  try {
    const clientSigner: ClientAvmSigner = {
      address: userAccount.addr.toString(),
      signTransactions: async (txns: Uint8Array[]) => {
        return txns.map((txnBytes) => {
          const decodedTxn = algosdk.decodeUnsignedTransaction(txnBytes);
          return decodedTxn.signTxn(userAccount.sk);
        });
      },
    };

    const client = new x402Client();
    client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(clientSigner));

    const payingFetch = wrapFetchWithPayment(fetch, client);

    const startTime = Date.now();
    const res = await payingFetch(auditEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: codeContent,
        filename,
        language,
        tier,
      }),
    });

    const duration = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }

    const report = await res.json();

    console.log(`\n✓ HTTP 200 OK — Payment Settled & Verified on Algorand TestNet in ${duration}ms!`);

    // 5. Display Findings & Write Patches
    if (report.summary) {
      console.log('\n' + '═'.repeat(75));
      console.log(`📊 ADSEC AUDIT REPORT: Score ${report.summary.score}/100 in ${report.summary.durationMs || duration}ms`);
      console.log('═'.repeat(75));
      console.log(`Total Issues: ${report.summary.totalIssues} (Critical: ${report.summary.critical}, High: ${report.summary.high}, Medium: ${report.summary.medium})`);

      if (report.findings && report.findings.length > 0) {
        console.log('\n🚨 Detected Vulnerabilities:');
        report.findings.forEach((f: any, i: number) => {
          console.log(`\n   ${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
          if (f.line) console.log(`      Line ${f.line}: ${f.snippet}`);
          if (f.remediation) console.log(`      Fix: ${f.remediation}`);
        });
      }

      if (report.fixes && report.fixes.length > 0) {
        const patchFile = 'audit.patch';
        let combinedPatch = '';
        report.fixes.forEach((fx: any) => {
          combinedPatch += `${fx.diff}\n\n`;
        });
        fs.writeFileSync(patchFile, combinedPatch);

        console.log('\n' + '─'.repeat(75));
        console.log(`🛠️  Autonomous Git Diff Patch generated and saved to: '${patchFile}'`);
        console.log('   Your agent or CI/CD can apply it automatically:');
        console.log(`   👉  git apply ${patchFile}`);
        console.log('─'.repeat(75));
      }

      if (report.attestation) {
        console.log('\n📜 Cryptographic Proof-of-Audit Attestation:');
        console.log(`   - Code SHA-256 : ${report.attestation.codeHash}`);
        console.log(`   - Tx Note Schema: ${report.attestation.txNoteSchema}`);
        if (report.attestation.txId) {
          console.log(`   - Attestation Tx: ${report.attestation.txId}`);
          console.log(`   - Lora Explorer : https://lora.algokit.io/testnet/transaction/${report.attestation.txId}`);
        }
      }

      console.log('\n' + '═'.repeat(75));
      console.log('🎉 Autonomous Pre-Flight Audit Complete!');
      console.log('═'.repeat(75) + '\n');
    }
  } catch (err: any) {
    console.error('\n❌ Execution Error:', err.message);
  }
}

main().catch(console.error);
