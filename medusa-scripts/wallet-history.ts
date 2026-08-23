import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941;
const MEDUSA_RECEIVER = 'LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ';

function decodeBase64Note(base64Str?: string): string {
  if (!base64Str) return '';
  try {
    return Buffer.from(base64Str, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * MEDUSA ON-CHAIN FINANCIAL LEDGER & TRANSACTION HISTORY
 * Queries the Algorand TestNet indexer to retrieve all account transactions, payments, attestations, and spending summary.
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
    const agentAddress = account.addr.toString();

    console.log(`\n========================================================================`);
    console.log(`MEDUSA ON-CHAIN FINANCIAL LEDGER & TRANSACTION HISTORY`);
    console.log(`========================================================================`);
    console.log(`Agent Wallet : ${agentAddress}`);

    // 1. Fetch Current Balance via Algod
    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    let accountInfo: any = null;
    try {
      accountInfo = await algodClient.accountInformation(agentAddress).do();
    } catch {
      accountInfo = { amount: 0, assets: [] };
    }

    const algoBalance = Number(accountInfo?.amount || 0) / 1e6;
    const usdcAsset = (accountInfo?.assets || []).find((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
    const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;

    console.log(`Current Balance: ${usdcBalance.toFixed(4)} USDC | ${algoBalance.toFixed(4)} ALGO`);
    console.log(`Querying Algorand TestNet Indexer for account transaction records...\n`);

    // 2. Fetch Transactions via Indexer
    const indexerUrl = `${INDEXER_SERVER}/v2/accounts/${agentAddress}/transactions?limit=50`;
    let rawTxns: any[] = [];
    try {
      const res = await fetch(indexerUrl);
      if (res.ok) {
        const data = await res.json();
        rawTxns = data.transactions || [];
      }
    } catch (err: any) {
      console.warn(`[!] Indexer query warning: ${err.message}`);
    }

    let totalUsdcSpent = 0;
    let auditCallCount = 0;
    const auditRecords: any[] = [];

    // Helper to process transaction node recursively
    const processTxNode = (tx: any, parentTxId?: string) => {
      const txId = parentTxId || tx.id;
      const roundTime = tx['round-time'] ? new Date(tx['round-time'] * 1000).toLocaleString() : 'Recent';
      const noteText = decodeBase64Note(tx.note);
      const isAssetTransfer = tx['tx-type'] === 'axfer' && tx['asset-transfer-transaction'];
      const isPayment = tx['tx-type'] === 'pay' && tx['payment-transaction'];
      const isAppCall = tx['tx-type'] === 'appl';

      if (isAssetTransfer) {
        const axfer = tx['asset-transfer-transaction'];
        const assetId = Number(axfer['asset-id'] || 0);
        const amountUsdc = Number(axfer.amount || 0) / 1e6;
        const receiver = axfer.receiver || '';

        if (assetId === USDC_ASA_ID) {
          if (tx.sender === agentAddress || receiver === MEDUSA_RECEIVER || amountUsdc > 0) {
            if (amountUsdc > 0 && tx.sender === agentAddress) {
              totalUsdcSpent += amountUsdc;
              auditCallCount++;
            }
            auditRecords.push({
              txId,
              type: amountUsdc > 0 ? 'x402 Micropayment' : 'USDC ASA Opt-In',
              amount: `$${amountUsdc.toFixed(3)} USDC`,
              sender: tx.sender || agentAddress,
              receiver: receiver || MEDUSA_RECEIVER,
              time: roundTime,
              note: noteText || 'x402 Security Audit Micropayment',
              loraUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
            });
          }
        }
      } else if (isPayment) {
        const pay = tx['payment-transaction'];
        const amountAlgo = Number(pay.amount || 0) / 1e6;
        const receiver = pay.receiver || '';

        if (noteText.includes('adsec') || noteText.includes('sha256') || noteText.includes('x402')) {
          auditRecords.push({
            txId,
            type: 'On-Chain Attestation',
            amount: `${amountAlgo.toFixed(3)} ALGO`,
            sender: tx.sender || agentAddress,
            receiver,
            time: roundTime,
            note: noteText,
            loraUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
          });
        } else if (amountAlgo > 0 && (tx.sender === agentAddress || receiver === agentAddress)) {
          auditRecords.push({
            txId,
            type: tx.sender === agentAddress ? 'ALGO Transfer (Out)' : 'ALGO Dispenser (In)',
            amount: `${amountAlgo.toFixed(3)} ALGO`,
            sender: tx.sender,
            receiver,
            time: roundTime,
            note: noteText || 'Algorand Network Transfer',
            loraUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
          });
        }
      } else if (isAppCall) {
        if (noteText || tx['application-transaction']) {
          auditRecords.push({
            txId,
            type: 'Facilitator Smart Contract',
            amount: '$0.000 USDC',
            sender: tx.sender,
            receiver: 'GoPlausible App',
            time: roundTime,
            note: noteText || 'x402 Facilitator Settlement Call',
            loraUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
          });
        }
      }

      // Check inner transactions recursively
      if (tx['inner-txns'] && Array.isArray(tx['inner-txns'])) {
        tx['inner-txns'].forEach((inner: any) => processTxNode(inner, txId));
      }
    };

    rawTxns.forEach((tx) => processTxNode(tx));

    // Deduplicate by txId + type
    const uniqueRecordsMap = new Map<string, any>();
    auditRecords.forEach((r) => {
      const key = `${r.txId}-${r.type}`;
      if (!uniqueRecordsMap.has(key)) {
        uniqueRecordsMap.set(key, r);
      }
    });
    const uniqueRecords = Array.from(uniqueRecordsMap.values());

    if (uniqueRecords.length === 0) {
      console.log(`[i] No transactions found on Algorand Indexer for address '${agentAddress}'.`);
      console.log(`    Note: Brand new wallets show 0 transactions until funded or active.`);
    } else {
      console.log(`Recent Account Transactions (${uniqueRecords.length} found):`);
      console.log('='.repeat(78));
      uniqueRecords.slice(0, 15).forEach((rec, idx) => {
        console.log(`\n[${idx + 1}] TxID: ${rec.txId}`);
        console.log(`    Time      : ${rec.time}`);
        console.log(`    Type      : ${rec.type} (${rec.amount})`);
        console.log(`    Sender    : ${rec.sender}`);
        console.log(`    Receiver  : ${rec.receiver}`);
        if (rec.note) console.log(`    Receipt   : ${rec.note}`);
        console.log(`    Lora Link : ${rec.loraUrl}`);
      });
      console.log('\n' + '='.repeat(78));
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
