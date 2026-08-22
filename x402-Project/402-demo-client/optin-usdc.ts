import { config } from 'dotenv';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

config();

const USDC_ASSET_ID = 10458941n;

async function optInUSDC() {
  const mnemonic = process.env.AVM_MNEMONIC?.trim();
  if (!mnemonic) {
    console.error('❌ AVM_MNEMONIC is not set in 402-demo-client/.env');
    process.exit(1);
  }

  const client = AlgorandClient.testNet();
  
  try {
    const account = client.account.fromMnemonic(mnemonic);
    console.log(`\nOpting in account ${account.addr.toString()} to USDC (Asset ID: ${USDC_ASSET_ID})...`);

    const result = await client.asset.bulkOptIn(account, [USDC_ASSET_ID]);
    console.log('\n✅ Successfully opted in to USDC on Algorand TestNet!');
    console.log(`   Transaction ID: ${result[0]?.transactionId}`);
    console.log(`   Explorer: https://lora.algokit.io/testnet/transaction/${result[0]?.transactionId}\n`);
  } catch (err: any) {
    console.error(`\n❌ Opt-in failed: ${err.message}`);
    console.log('\nMake sure your account is funded with at least 0.2 ALGO first:');
    console.log('https://lora.algokit.io/testnet/fund\n');
  }
}

optInUSDC();
