import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

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
    console.log(`💳 AGENT WALLET DIAGNOSTIC: ${account.addr}`);
    console.log(`======================================================`);

    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    const accountInfo = await algodClient.accountInformation(account.addr).do();

    const algoBalance = Number(accountInfo.amount) / 1e6;
    console.log(`🔹 ALGO Balance : ${algoBalance} ALGO`);

    const usdcAsset = accountInfo.assets?.find((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
    const hasOptedIn = !!usdcAsset;
    const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;

    console.log(`🔹 USDC Opt-in  : ${hasOptedIn ? '✅ Opted In (ASA #10458941)' : '❌ NOT Opted In'}`);
    console.log(`🔹 USDC Balance : ${usdcBalance} USDC`);
    console.log(`======================================================`);

    if (!hasOptedIn) {
      console.log(`\n⚠️  ACTION REQUIRED: Opt-in to USDC before making audit calls.`);
      console.log(`   Run: npx tsx medusa-scripts/optin-usdc.ts`);
    } else if (usdcBalance < 0.001) {
      console.log(`\n⚠️  ACTION REQUIRED: Fund your wallet with TestNet USDC.`);
      console.log(`   Claim free USDC at: https://faucet.circle.com (Select Algorand TestNet)`);
    } else {
      console.log(`\n✅ Ready! Your wallet has sufficient balance for ~${Math.floor(usdcBalance / 0.001)} paid audits.`);
    }
    console.log();
  } catch (err: any) {
    console.error(`❌ Diagnostic Error:`, err.message);
  }
}

main().catch(console.error);
