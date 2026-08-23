import algosdk from 'algosdk';

function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔑 MEDUSA: GENERATE NEW AGENT ALGORAND TESTNET WALLET');
  console.log('═'.repeat(70));

  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

  console.log('\n✅ Fresh Keypair Generated:');
  console.log(`   Public Address : ${account.addr}`);
  console.log(`   25-Word Mnemonic: "${mnemonic}"`);

  console.log('\n' + '─'.repeat(70));
  console.log('📋 ACTIVATION CHECKLIST:');
  console.log('─'.repeat(70));
  console.log('1. Claim free TestNet ALGO for gas (0.5 ALGO):');
  console.log(`   https://lora.algokit.io/testnet/dispenser`);
  console.log('\n2. Add to your project .env:');
  console.log(`   AGENT_MNEMONIC="${mnemonic}"`);
  console.log('\n3. Opt-in to USDC:');
  console.log(`   npx tsx medusa-scripts/optin-usdc.ts`);
  console.log('\n4. Claim free TestNet USDC:');
  console.log(`   https://faucet.circle.com (Select Algorand TestNet, ASA #10458941)`);
  console.log('═'.repeat(70) + '\n');
}

main();
