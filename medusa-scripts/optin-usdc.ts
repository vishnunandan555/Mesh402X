import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941;

/**
 * 1-CLICK USDC ASA OPT-IN SCRIPT
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
    const addr = account.addr.toString();

    console.log(`\n======================================================`);
    console.log(`[+] MEDUSA: OPT-IN TO TESTNET USDC (ASA #${USDC_ASA_ID})`);
    console.log(`======================================================`);
    console.log(`Wallet: ${addr}`);

    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    let accountInfo: any = null;

    try {
      accountInfo = await algodClient.accountInformation(addr).do();
    } catch (err: any) {
      accountInfo = { amount: 0, assets: [] };
    }

    const usdcAsset = (accountInfo?.assets || []).find((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
    if (usdcAsset) {
      console.log(`[OK] Already opted in to USDC! Current balance: ${(Number(usdcAsset.amount) / 1e6).toFixed(2)} USDC`);
      process.exit(0);
    }

    const algoBalance = Number(accountInfo?.amount || 0) / 1e6;
    if (algoBalance < 0.1) {
      console.error(`\n[!] Insufficient ALGO for gas (${algoBalance.toFixed(4)} ALGO).`);
      console.log(`To opt in to USDC, your account needs at least 0.1 ALGO (minimum balance requirement + 0.001 gas).`);
      console.log(`👉 Claim free TestNet ALGO here: https://lora.algokit.io/testnet/dispenser`);
      process.exit(1);
    }

    console.log(`Submitting 0-amount opt-in transaction for ASA #${USDC_ASA_ID}...`);
    const params = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: addr,
      receiver: addr,
      assetIndex: USDC_ASA_ID,
      amount: 0,
      suggestedParams: params
    });

    const signedTxn = optInTxn.signTxn(account.sk);
    const txId = optInTxn.txID().toString();
    console.log(`Broadcasting transaction ID: ${txId}...`);

    await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);

    console.log(`\n[OK] Successfully opted in to USDC ASA #${USDC_ASA_ID}!`);
    console.log(`Lora Explorer: https://lora.algokit.io/testnet/transaction/${txId}`);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error('[!] Opt-in error:', err.message);
  }
}

main().catch(console.error);
