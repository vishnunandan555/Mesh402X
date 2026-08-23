import { config } from 'dotenv';
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from '@x402/fetch';
import { toClientAvmSigner, ExactAvmScheme, ALGORAND_TESTNET_CAIP2 } from '@x402/avm';
import { ed25519Generator } from '@algorandfoundation/algokit-utils/crypto';
import { seedFromMnemonic } from '@algorandfoundation/algokit-utils/algo25';
import * as fs from 'fs';
import * as path from 'path';

config();

const avmMnemonic = process.env.AVM_MNEMONIC as string;
const AUDIT_URL = process.env.ADSEC_SERVER_URL || 'http://localhost:4021/adsec/audit';

const SAMPLE_VULNERABLE_CODE = `
import os
import reqeusts  # Typosquatting package

# Hardcoded Leaked Secret
OPENAI_API_KEY = "sk-proj-abc123456789012345678901234567890"

def get_user_records(user_id):
    # SQL Injection via direct string formatting
    sql_query = f"SELECT * FROM users WHERE id = {user_id}"
    
    # Command Injection hazard
    os.system(f"echo Querying user {user_id}")
    
    # Insecure deserialization
    import pickle
    user_state = pickle.loads(b"cos\\nsystem\\n(S'whoami'\\ntR.")
    
    return sql_query
`.trim();

function getSecretKeyFromMnemonic(mnemonic: string): string {
  const seed = seedFromMnemonic(mnemonic.trim());
  const { ed25519Pubkey } = ed25519Generator(new Uint8Array(seed));
  return Buffer.concat([Buffer.from(seed), Buffer.from(ed25519Pubkey)]).toString('base64');
}

async function main(): Promise<void> {
  if (!avmMnemonic) {
    console.error('❌ AVM_MNEMONIC is not set in 402-demo-client/.env');
    console.log('Run "npm run check-wallet" or "npm run generate-payer" to configure your account.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const filePath = args.find(a => !a.startsWith('--'));
  const tierArg = args.find(a => a.startsWith('--tier='));
  const tier = (tierArg ? tierArg.split('=')[1] : 'tier2') as 'tier1' | 'tier2';
  const endpointArg = args.find(a => a.startsWith('--endpoint='));
  const selectedEndpoint = endpointArg ? endpointArg.split('=')[1] : 'scan';

  const baseUrl = process.env.ADSEC_SERVER_URL || 'http://localhost:4021';
  let targetUrl = `${baseUrl}/adsec/${selectedEndpoint}`;
  if (selectedEndpoint === 'weather') {
    targetUrl = `${baseUrl}/weather`;
  }

  let code = SAMPLE_VULNERABLE_CODE;
  let filename = 'vulnerable-auth.py';

  if (filePath && fs.existsSync(filePath)) {
    code = fs.readFileSync(filePath, 'utf-8');
    filename = path.basename(filePath);
  }

  const ext = path.extname(filename).toLowerCase();
  let language: 'python' | 'javascript' | 'typescript' | 'solidity' = 'python';
  if (ext === '.js') language = 'javascript';
  else if (ext === '.ts') language = 'typescript';
  else if (ext === '.sol') language = 'solidity';

  console.log('\n' + '═'.repeat(65));
  console.log('🤖 ADSEC Autonomous Agent — Live On-Chain Security Pipeline');
  console.log('═'.repeat(65));
  console.log(`📁 Target File : ${filename} (${language})`);
  console.log(`🏷️ Service Tier: ${tier.toUpperCase()}`);
  console.log(`🎯 Endpoint    : ${targetUrl}`);
  console.log('═'.repeat(65));

  const secretKey = getSecretKeyFromMnemonic(avmMnemonic);
  const avmSigner = toClientAvmSigner(secretKey);

  const client = new x402Client();
  client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(avmSigner));
  client.register('algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', new ExactAvmScheme(avmSigner));

  console.info(`\n🔑 AVM Signer Address: ${avmSigner.address}`);
  console.log('📡 Sending payload to ADSEC node (expecting HTTP 402 challenge)...');

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  const response = await fetchWithPayment(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      language,
      tier,
      filename,
    }),
  });

  if (response.ok) {
    const paymentResponse = new x402HTTPClient(client).getPaymentSettleResponse(name =>
      response.headers.get(name),
    );

    console.log('\n' + '─'.repeat(65));
    console.log('💳 ON-CHAIN PAYMENT SETTLED!');
    console.log('─'.repeat(65));
    if (paymentResponse) {
      console.log(`Transaction ID: ${(paymentResponse as any).transaction || 'Confirmed'}`);
      console.log(`Explorer Link : https://lora.algokit.io/testnet/transaction/${(paymentResponse as any).transaction}`);
      console.log(`Network       : Algorand TestNet (via GoPlausible Facilitator)`);
    }

    const result = await response.json();

    console.log('\n' + '═'.repeat(65));
    console.log(`🛡️  ADSEC AUDIT REPORT: ${result.summary?.score || 0}/100 Security Score (${result.summary?.durationMs || 0}ms)`);
    console.log('═'.repeat(65));
    console.log(`⚠️  Total Issues Found: ${result.summary?.totalIssues || 0}`);
    console.log(`   • Critical : ${result.summary?.critical || 0}`);
    console.log(`   • High     : ${result.summary?.high || 0}`);
    console.log(`   • Medium   : ${result.summary?.medium || 0}`);
    console.log(`   • Low      : ${result.summary?.low || 0}`);
    console.log('─'.repeat(65));

    if (result.findings && result.findings.length > 0) {
      console.log('\n📋 DETAILED VULNERABILITY FINDINGS:');
      result.findings.forEach((f: any, idx: number) => {
        const icon = f.severity === 'critical' ? '🔴 [CRITICAL]' : f.severity === 'high' ? '🟠 [HIGH]' : '🟡 [MEDIUM]';
        console.log(`\n${idx + 1}. ${icon} ${f.title}`);
        if (f.line) console.log(`   📍 Line ${f.line}: \`${f.snippet || ''}\``);
        console.log(`   💡 Remediation: ${f.remediation}`);
        if (f.cweId) console.log(`   🏷️ Reference: ${f.cweId}`);
      });
    }

    if (result.fixes && result.fixes.length > 0) {
      console.log('\n' + '═'.repeat(65));
      console.log('✨ [ADSEC Auto-Remediation] Generated Actionable Git Diff Patches:');
      console.log('═'.repeat(65));
      for (const fix of result.fixes) {
        console.log(`\n# Fix for: ${fix.findingId || 'Vulnerability'}`);
        console.log(fix.diff);
        if (fix.explanation) console.log(`Explanation: ${fix.explanation}`);
      }
    }

    console.log('\n' + '═'.repeat(65));
    console.log('✅ Machine-to-Machine x402 Audit Completed & Verified On-Chain!');
    console.log('═'.repeat(65) + '\n');
  } else {
    console.log(`\n❌ Payment failed or rejected (response status: ${response.status})`);
    const errText = await response.text();
    console.log('Details:', errText);
  }
}

main().catch(error => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
