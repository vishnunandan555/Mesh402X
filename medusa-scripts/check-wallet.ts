import algosdk from 'algosdk';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const USDC_ASA_ID = 10458941;

/**
 * MEDUSA WALLET BALANCE & OPT-IN DIAGNOSTIC
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
    console.log('Please add your 25-word Algorand TestNet mnemonic to wallet.env');
    process.exit(1);
  }

  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const addr = account.addr.toString();

    console.log(`\n======================================================`);
    console.log(`[+] MEDUSA: AGENT WALLET DIAGNOSTIC`);
    console.log(`======================================================`);
    console.log(`Address: ${addr}`);

    const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
    let accountInfo: any = null;

    try {
      accountInfo = await algodClient.accountInformation(addr).do();
    } catch (err: any) {
      // Handle brand new un-funded Algorand accounts gracefully (Algod returns 404 for empty accounts)
      accountInfo = { amount: 0, assets: [] };
    }

    const algoBalance = Number(accountInfo?.amount || 0) / 1e6;
    console.log(`\nBalances:`);
    console.log(`  * ALGO (Gas) : ${algoBalance.toFixed(4)} ALGO ${algoBalance < 0.1 ? '([!] Low/Unfunded - claim at dispenser)' : '([OK])'}`);

    const usdcAsset = (accountInfo?.assets || []).find((a: any) => Number(a['asset-id'] ?? a.assetId ?? a['assetId'] ?? a.asset_id ?? 0) === USDC_ASA_ID);
    if (usdcAsset) {
      const usdcBalance = Number(usdcAsset.amount) / 1e6;
      console.log(`  * USDC (ASA) : $${usdcBalance.toFixed(4)} USDC (Opted-in: YES)`);
      console.log(`  * Capacity   : ~${Math.floor(usdcBalance / 0.001)} paid audit calls available`);
    } else {
      console.log(`  * USDC (ASA) : [!] NOT OPTED IN (Run: npx tsx medusa-scripts/optin-usdc.ts)`);
    }

    console.log(`\nUseful Links:`);
    console.log(`  * Dispenser (Free ALGO): https://lora.algokit.io/testnet/dispenser`);
    console.log(`  * Circle Faucet (USDC):  https://faucet.circle.com (Select Algorand TestNet, ASA #10458941)`);
    console.log(`  * Lora Account Explorer: https://lora.algokit.io/testnet/account/${addr}`);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error('[!] Error checking wallet:', err.message);
  }
}

main().catch(console.error);
