/**
 * ADSEC Autonomous Agent: REAL Bazaar Discovery & Paid Hire
 *
 * A headless agent that:
 *   1. Queries the live GoPlausible Bazaar registry (proof-of-settlement index).
 *   2. Lists real discovered x402 resources and picks a security-audit target.
 *   3. Executes a genuine paid audit via the x402 protocol
 *      (402 challenge -> programmatic signature -> on-chain settlement).
 *   4. Prints the settlement TxID with a Lora Explorer verification link.
 *
 * Setup (x402-Project/x402-demo-server/.env):
 *   PAYER_MNEMONIC="25-word funded testnet seed phrase"
 *
 * Usage:
 *   npx tsx scripts/agent-discover-and-audit.ts [backendUrl]
 */

import * as dotenv from 'dotenv';
import algosdk from 'algosdk';
import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm/exact/client';
import { ALGORAND_TESTNET_CAIP2, type ClientAvmSigner } from '@x402-avm/avm';

dotenv.config();

const BAZAAR_DISCOVERY_URL =
  'https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=100';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';

const SAMPLE_CODE = `
import os
import reqeusts  # Typosquatting

OPENAI_KEY = "sk-proj-abc1234567890123456789012345"

def query_user(user_id):
    sql = f"SELECT * FROM accounts WHERE id = {user_id}"
    os.system(f"echo User queried: {user_id}")
    return sql
`.trim();

interface DiscoveredResource {
  url?: string;
  resourceUrl?: string;
  description?: string;
}

async function main() {
  const fallbackBackend = (process.argv[2] || process.env.VITE_API_BASE_URL || 'http://localhost:4021').replace(/\/$/, '');

  console.log('\n' + '═'.repeat(70));
  console.log('[AGENTIC COMMERCE] Live Discovery & Autonomous Paid Hire');
  console.log('═'.repeat(70));

  // STEP 1: Real registry query
  console.log('\n[Discovery] Querying GoPlausible Bazaar registry...');
  console.log(`[GET] ${BAZAAR_DISCOVERY_URL}`);

  let discovered: DiscoveredResource[] = [];
  try {
    const res = await fetch(BAZAAR_DISCOVERY_URL, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data: any = await res.json();
      discovered = Array.isArray(data) ? data : data.items || data.resources || [];
      console.log(`[OK] Registry online - ${discovered.length} resource(s) catalogued network-wide.`);
      discovered.slice(0, 5).forEach((r, i) => {
        const u = r.resourceUrl ?? r.url;
        console.log(`     ${i + 1}. ${u || '(unknown)'}${r.description ? ` - ${String(r.description).slice(0, 60)}` : ''}`);
      });
    }
  } catch {
    console.log('[INFO] Registry unreachable - continuing with direct target.');
  }

  // STEP 2: Pick target: prefer an ADSEC/Medusa node from the registry, else fallback URL
  const match = discovered.find((r) => {
    const u = r.resourceUrl ?? r.url;
    return typeof u === 'string' && /adsec|medusa/i.test(u + ' ' + (r.description || ''));
  });
  const matchUrl = match ? (match.resourceUrl ?? match.url) : undefined;
  const baseUrl = typeof matchUrl === 'string' && matchUrl.startsWith('http')
    ? matchUrl.replace(/\/adsec.*$/, '').replace(/\/$/, '')
    : fallbackBackend;
  const auditEndpoint = `${baseUrl}/adsec/audit`;

  console.log(`\n[Hire Decision] Target selected: ${auditEndpoint}`);
  if (!match) {
    console.log('   (Not yet in the Bazaar - the first on-chain settlement against this');
    console.log('    PUBLIC url triggers proof-of-settlement indexing. Run agent-live-onchain.ts');
    console.log('    against the deployed Render URL to get listed.)');
  }

  // STEP 3: Load payer wallet
  const payerMnemonic = process.env.PAYER_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.AGENT_MNEMONIC;
  if (!payerMnemonic) {
    console.log('\n[PAYMENT SKIPPED] No PAYER_MNEMONIC configured.');
    console.log('Add it to x402-demo-server/.env and re-run to execute the paid hire:');
    console.log('  PAYER_MNEMONIC="word1 word2 ... word25"');
    return;
  }

  const payer = algosdk.mnemonicToSecretKey(payerMnemonic.trim());
  console.log(`\n[Agent Wallet] ${payer.addr.toString()}`);

  const algod = new algosdk.Algodv2('', ALGOD_SERVER, '');
  const info = await algod.accountInformation(payer.addr.toString()).do();
  const usdcHolding = (info.assets as any[] | undefined)?.find((a) => a['asset-id'] === 10458941);
  console.log(`   ALGO: ${Number(info.amount) / 1e6} | USDC: ${usdcHolding ? Number(usdcHolding.amount) / 1e6 : 0}`);

  // STEP 4: Real paid audit via x402
  console.log(`\n[Execution] POST ${auditEndpoint} (expecting HTTP 402 challenge)...`);

  const clientSigner: ClientAvmSigner = {
    address: payer.addr.toString(),
    signTransactions: async (txns: Uint8Array[]) =>
      txns.map((raw) => {
        const txn = algosdk.decodeUnsignedTransaction(raw);
        return new Uint8Array(txn.signTxn(payer.sk));
      }),
  };

  const client = new x402Client();
  client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(clientSigner, { algodUrl: ALGOD_SERVER }));
  const payingFetch = wrapFetchWithPayment(fetch, client);

  const auditRes = await payingFetch(auditEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: SAMPLE_CODE, language: 'python', filename: 'account_service.py', tier: 'tier2' }),
  });

  if (!auditRes.ok) {
    throw new Error(`HTTP ${auditRes.status}: ${(await auditRes.text().catch(() => '')) || auditRes.statusText}`);
  }
  const report: any = await auditRes.json();
  console.log(`[OK] HTTP 200 - paid audit delivered.`);

  // STEP 5: Settlement proof
  const settleHeader = auditRes.headers.get('payment-response');
  if (settleHeader) {
    try {
      const settle = JSON.parse(Buffer.from(settleHeader, 'base64').toString('utf-8'));
      const payTxId = settle.transaction || settle.transactionId || settle.txId;
      if (payTxId) {
        console.log(`\n💸 Settlement Proof:`);
        console.log(`   - Payment TxID   : ${payTxId}`);
        console.log(`   - Lora Explorer  : https://lora.algokit.io/testnet/transaction/${payTxId}`);
      }
    } catch {
      /* non-fatal */
    }
  }

  // STEP 6: Report
  if (report.summary) {
    console.log('\n' + '─'.repeat(70));
    console.log(`[AUDIT REPORT] Score ${report.summary.score}/100 in ${report.summary.durationMs || '?'}ms`);
    console.log('─'.repeat(70));
    console.log(
      `Total Issues: ${report.summary.totalIssues ?? '?'} (Critical: ${report.summary.critical ?? 0}, High: ${
        report.summary.high ?? 0
      })`
    );
    (report.findings || []).forEach((f: any, i: number) => {
      console.log(`   ${i + 1}. [${String(f.severity).toUpperCase()}] ${f.title}`);
    });
    (report.fixes || []).forEach((fix: any, i: number) => {
      console.log(`\n# Patch #${i + 1} (${fix.findingId || 'fix'}):\n${fix.diff}`);
    });
  }

  if (report.attestation?.txId) {
    console.log(`\n⛓️ Attestation note txn: https://lora.algokit.io/testnet/transaction/${report.attestation.txId}`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('[COMPLETED] Discovery -> hire -> payment -> settlement -> report. All machine-driven.');
  console.log('═'.repeat(70) + '\n');
}

main().catch((err) => {
  console.error('[FATAL]', err?.message || err);
  process.exit(1);
});
