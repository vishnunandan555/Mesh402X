import algosdk from 'algosdk';

/**
 * GENERATE NEW AGENT ALGORAND TESTNET KEYPAIR
 */
function main() {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

  console.log(`\n======================================================================`);
  console.log(`MEDUSA: GENERATE NEW AGENT ALGORAND TESTNET WALLET`);
  console.log(`======================================================================`);
  console.log(`\n[+] Fresh Keypair Generated:`);
  console.log(`   Public Address  : ${account.addr}`);
  console.log(`   25-Word Mnemonic: ${mnemonic}`);
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`ACTIVATION CHECKLIST:`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`1. Claim free TestNet ALGO for gas (0.5 ALGO):`);
  console.log(`   https://lora.algokit.io/testnet/dispenser`);
  console.log(`\n2. Add to your project wallet.env:`);
  console.log(`   AGENT_MNEMONIC="${mnemonic}"`);
  console.log(`\n3. Opt-in to USDC:`);
  console.log(`   npx tsx medusa-scripts/optin-usdc.ts`);
  console.log(`\n4. Claim free TestNet USDC:`);
  console.log(`   https://faucet.circle.com (Select Algorand TestNet, ASA #10458941)`);
  console.log(`======================================================================\n`);
}

main();
