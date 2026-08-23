import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941;

async function main() {
  const mnemonic = process.env.AGENT_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.PAYER_MNEMONIC;
  if (!mnemonic) {
    console.error('❌ Error: Missing AGENT_MNEMONIC in .env');
    process.exit(1);
  }

  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`\n======================================================`);
    console.log(`⚡ OPTING IN TO TESTNET USDC (ASA #${USDC_ASA_ID})`);
    console.log(`======================================================`);
    console.log(`💳 Address: ${account.addr}`);

    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    const accountInfo = await algodClient.accountInformation(account.addr).do();

    const algoBalance = Number(accountInfo.amount) / 1e6;
    if (algoBalance < 0.1) {
      console.error(`❌ Error: Insufficient ALGO balance (${algoBalance} ALGO).`);
      console.log(`   Get free TestNet ALGO for gas from: https://lora.algokit.io/testnet/dispenser`);
      process.exit(1);
    }

    const alreadyOpted = accountInfo.assets?.some((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
    if (alreadyOpted) {
      console.log(`✅ Already opted in to TestNet USDC (ASA #${USDC_ASA_ID})! No action needed.`);
      return;
    }

    console.log(`📡 Broadcasting 0-amount asset transfer transaction to opt-in...`);
    const params = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: account.addr,
      amount: 0,
      assetIndex: USDC_ASA_ID,
      suggestedParams: params,
    });

    const signedTxn = optInTxn.signTxn(account.sk);
    const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = sendResult.txid || optInTxn.txID();

    console.log(`✅ SUCCESS: Opt-in transaction confirmed!`);
    console.log(`⛓️  TxID: ${txId}`);
    console.log(`🔗 Link: https://lora.algokit.io/testnet/transaction/${txId}`);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error(`❌ Opt-in Failed:`, err.message);
  }
}

main().catch(console.error);
