import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941;
const MEDUSA_RECEIVER = 'LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ';

/**
 * MEDUSA FINANCIAL & TRANSACTION HISTORY EXPLORER
 * Queries the Algorand TestNet indexer to retrieve on-chain payments, attestation receipts, and spending summary.
 */
async function main() {
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

  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const agentAddress = account.addr;

    console.log(`\n========================================================================`);
    console.log(`MEDUSA ON-CHAIN FINANCIAL LEDGER & TRANSACTION HISTORY`);
    console.log(`========================================================================`);
    console.log(`Agent Wallet : ${agentAddress}`);

    // 1. Fetch Current Balance via Algod
    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    const accountInfo = await algodClient.accountInformation(agentAddress).do();
    const algoBalance = Number(accountInfo.amount) / 1e6;
    const usdcAsset = accountInfo.assets?.find((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
    const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;

    console.log(`Current Balance: ${usdcBalance.toFixed(4)} USDC | ${algoBalance.toFixed(4)} ALGO`);
    console.log(`Querying Algorand TestNet Indexer for audit settlement receipts...\n`);

    // 2. Fetch Transactions via Indexer
    const indexerUrl = `${INDEXER_SERVER}/v2/accounts/${agentAddress}/transactions?limit=30`;
    const res = await fetch(indexerUrl);
    if (!res.ok) {
      throw new Error(`Indexer responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const txns: any[] = data.transactions || [];

    let totalUsdcSpent = 0;
    let auditCallCount = 0;
    const auditRecords: any[] = [];

    txns.forEach((tx) => {
      const isAssetTransfer = tx['tx-type'] === 'axfer' && tx['asset-transfer-transaction'];
      const isPayment = tx['tx-type'] === 'pay';
      const roundTime = tx['round-time'] ? new Date(tx['round-time'] * 1000).toLocaleString() : 'N/A';
      
      let noteText = '';
      if (tx.note) {
        try {
          noteText = Buffer.from(tx.note, 'base64').toString('utf-8');
        } catch {}
      }

      if (isAssetTransfer) {
        const axfer = tx['asset-transfer-transaction'];
        if (Number(axfer['asset-id']) === USDC_ASA_ID) {
          const amountUsdc = Number(axfer.amount) / 1e6;
          const receiver = axfer.receiver;
          
          if (tx.sender === agentAddress && (receiver === MEDUSA_RECEIVER || amountUsdc > 0)) {
            totalUsdcSpent += amountUsdc;
            auditCallCount++;
            auditRecords.push({
              txId: tx.id,
              type: 'x402 Micropayment',
              amount: `$${amountUsdc.toFixed(3)} USDC`,
              receiver,
              time: roundTime,
              note: noteText || 'x402 Security Audit Fee',
              loraUrl: `https://lora.algokit.io/testnet/transaction/${tx.id}`
            });
          }
        }
      } else if (noteText.includes('adsec') || noteText.includes('sha256')) {
        auditRecords.push({
          txId: tx.id,
          type: 'On-Chain Attestation',
          amount: '$0.000',
          receiver: tx.sender,
          time: roundTime,
          note: noteText,
          loraUrl: `https://lora.algokit.io/testnet/transaction/${tx.id}`
        });
      }
    });

    if (auditRecords.length === 0) {
      console.log(`[i] No prior Medusa audit payments found for this account yet.`);
    } else {
      console.log(`Recent Audit & Settlement Transactions (${auditRecords.length} found):`);
      console.log('-'.repeat(72));
      auditRecords.slice(0, 10).forEach((rec, idx) => {
        console.log(`\n[${idx + 1}] TxID: ${rec.txId}`);
        console.log(`    Date/Time : ${rec.time}`);
        console.log(`    Type      : ${rec.type} (${rec.amount})`);
        if (rec.note) console.log(`    Receipt   : ${rec.note}`);
        console.log(`    Lora Link : ${rec.loraUrl}`);
      });
      console.log('\n' + '-'.repeat(72));
    }

    console.log(`\nFINANCIAL SUMMARY:`);
    console.log(`   * Total Paid Audits Executed : ${auditCallCount}`);
    console.log(`   * Total USDC Micro-Payments  : $${totalUsdcSpent.toFixed(4)} USDC`);
    console.log(`   * Remaining Agent Budget     : $${usdcBalance.toFixed(4)} USDC (~${Math.floor(usdcBalance / 0.001)} calls remaining)`);
    console.log(`========================================================================\n`);
  } catch (err: any) {
    console.error(`[!] Error querying transaction history:`, err.message);
  }
}

main().catch(console.error);
