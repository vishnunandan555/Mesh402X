import crypto from 'crypto';
import { mnemonicFromSeed, seedFromMnemonic } from '@algorandfoundation/algokit-utils/algo25';
import { ed25519Generator } from '@algorandfoundation/algokit-utils/crypto';
import { toClientAvmSigner } from '@x402/avm';

async function generateAlgo25Account() {
  const seed = crypto.randomBytes(32);
  const mnemonic = mnemonicFromSeed(seed);
  const { ed25519Pubkey } = ed25519Generator(new Uint8Array(seed));
  const b64SecretKey = Buffer.concat([
    Buffer.from(seed),
    Buffer.from(ed25519Pubkey),
  ]).toString('base64');
  const signer = toClientAvmSigner(b64SecretKey);

  console.log('\n' + '═'.repeat(65));
  console.log('🔑 NEW ALGORAND TESTNET ALGO25 PAYER ACCOUNT GENERATED');
  console.log('═'.repeat(65));
  console.log('\nPublic Address:');
  console.log(`  ${signer.address}`);
  console.log('\n25-Word Mnemonic (Keep private, use in 402-demo-client/.env):');
  console.log(`  "${mnemonic}"`);
  console.log('\n' + '─'.repeat(65));
  console.log('📋 NEXT STEPS TO ACTIVATE THIS PAYER:');
  console.log('1. Set in 402-demo-client/.env:');
  console.log(`   AVM_MNEMONIC="${mnemonic}"`);
  console.log('2. Fund with TestNet ALGO:');
  console.log(`   https://lora.algokit.io/testnet/fund?address=${signer.address}`);
  console.log('3. Opt-in to USDC (Asset ID: 10458941):');
  console.log('   Use Lora Txn Wizard -> Asset Opt-in (axfer) or Pera/Lora');
  console.log('4. Fund with TestNet USDC:');
  console.log(`   https://faucet.circle.com/ (Select Algorand Testnet, enter ${signer.address})`);
  console.log('5. Verify status:');
  console.log('   npx tsx check-wallet.ts');
  console.log('═'.repeat(65) + '\n');
}

generateAlgo25Account().catch(console.error);
