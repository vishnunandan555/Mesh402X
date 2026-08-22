import { config } from 'dotenv';
import { seedFromMnemonic } from '@algorandfoundation/algokit-utils/algo25';
import { ed25519Generator } from '@algorandfoundation/algokit-utils/crypto';
import { toClientAvmSigner } from '@x402/avm';

config();

const USDC_ASSET_ID = 10458941;

async function checkWallet() {
  console.log('\n' + '═'.repeat(65));
  console.log('🔍 ADSEC / x402 PAYER WALLET STATUS CHECK');
  console.log('═'.repeat(65));

  const mnemonic = process.env.AVM_MNEMONIC?.trim();
  if (!mnemonic) {
    console.error('❌ AVM_MNEMONIC is not set in 402-demo-client/.env');
    console.log('\nTip: Run "npx tsx generate-account.ts" to generate a fresh Algo25 account.');
    process.exit(1);
  }

  const wordCount = mnemonic.split(/\s+/).length;
  console.log(`Mnemonic word count: ${wordCount} words`);

  if (wordCount !== 25) {
    console.warn(`\n⚠️ Warning: Mnemonic has ${wordCount} words. Native Algo25 requires exactly 25 words.`);
    if (wordCount === 24) {
      console.warn('   You are currently using a 24-word BIP-39 / Pera phrase.');
      console.warn('   Run "npx tsx generate-account.ts" to generate a native 25-word Algo25 account.');
    }
    return;
  }

  let address = '';
  try {
    const seed = seedFromMnemonic(mnemonic);
    const { ed25519Pubkey } = ed25519Generator(new Uint8Array(seed));
    const b64SecretKey = Buffer.concat([
      Buffer.from(seed),
      Buffer.from(ed25519Pubkey),
    ]).toString('base64');
    const signer = toClientAvmSigner(b64SecretKey);
    address = signer.address;
  } catch (err: any) {
    console.error(`\n❌ Failed to decode Algo25 mnemonic: ${err.message}`);
    return;
  }

  console.log(`\n✅ Valid Algo25 Payer Address: ${address}`);
  console.log(`   Lora Explorer: https://lora.algokit.io/testnet/account/${address}`);

  // Fetch account status from Algorand TestNet
  try {
    const res = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${address}`);
    if (res.status === 404) {
      console.log('\n❌ Account not found on TestNet (Unfunded account).');
      console.log('👉 Fund with ALGO here: https://lora.algokit.io/testnet/fund?address=' + address);
      return;
    }

    const data = (await res.json()) as any;
    const algoBalance = (data.amount || 0) / 1e6;
    const minBalance = (data['min-balance'] || 100000) / 1e6;
    const assets = data.assets || [];

    const usdcAsset = assets.find((a: any) => a['asset-id'] === USDC_ASSET_ID);
    const isOptedIn = !!usdcAsset;
    const usdcBalance = isOptedIn ? (usdcAsset.amount || 0) / 1e6 : 0;

    console.log('\n📊 Account Balances:');
    console.log(`   ALGO Balance:      ${algoBalance.toFixed(6)} ALGO (Min required: ${minBalance.toFixed(6)} ALGO)`);
    console.log(`   USDC Opt-in:       ${isOptedIn ? '✅ Opted In' : '❌ NOT Opted In (Asset ID: ' + USDC_ASSET_ID + ')'}`);
    console.log(`   USDC Balance:      ${usdcBalance.toFixed(6)} USDC`);

    console.log('\n' + '─'.repeat(65));
    if (algoBalance < 0.2) {
      console.log('⚠️ Action Needed: Fund account with ALGO for fees & min balance:');
      console.log(`   https://lora.algokit.io/testnet/fund?address=${address}`);
    } else if (!isOptedIn) {
      console.log('⚠️ Action Needed: Opt into USDC (Asset ID: 10458941):');
      console.log('   Run: npx tsx optin-usdc.ts');
    } else if (usdcBalance < 0.005) {
      console.log('⚠️ Action Needed: Fund with TestNet USDC:');
      console.log(`   1. Visit Circle Faucet: https://faucet.circle.com/ (Select Algorand Testnet)`);
      console.log(`   2. Or send USDC from another TestNet account to: ${address}`);
    } else {
      console.log('🎉 READY! Payer account has sufficient ALGO and USDC.');
      console.log('   Run "npx tsx index.ts" to test the x402 payment flow!');
    }
    console.log('═'.repeat(65) + '\n');
  } catch (err: any) {
    console.error(`\n❌ Failed to query TestNet node: ${err.message}`);
  }
}

checkWallet();
