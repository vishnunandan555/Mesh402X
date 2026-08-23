import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import algosdk from 'algosdk';
import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm';

dotenv.config();
dotenv.config({ path: 'wallet.env' });

/**
 * MEDUSA CI/CD SECURITY SCORER & THRESHOLD GUARD
 * Scans code or manifest files (pubspec.yaml, package.json, requirements.txt, go.mod, etc.)
 * Calculates dynamic security score based on CVEs/hazards, and exits with 0 (PASS) or 1 (FAIL).
 */
async function main() {
  const args = process.argv.slice(2);
  const targetFile = args[0];
  const scoreOnly = args.includes('--score-only') || args.includes('-s');
  
  // Optional threshold parameter (default: 80/100)
  const thresholdArg = args.find((a) => !a.startsWith('-') && a !== targetFile);
  const minThreshold = thresholdArg ? parseInt(thresholdArg, 10) : 80;

  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error(`[!] Error: Target file '${targetFile || ''}' not found.`);
    console.log(`Usage: npx tsx audit-score.ts <path_to_file_or_manifest> [min_score_threshold] [--score-only]`);
    process.exit(1);
  }

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

  const backendUrl = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
  const endpointUrl = `${backendUrl.replace(/\/$/, '')}/adsec/scan`;

  // 1. Load Account
  const agentAccount = algosdk.mnemonicToSecretKey(mnemonic);

  // 2. Setup x402 Client
  const client = new x402Client();
  client.register('algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=', new ExactAvmScheme({
    address: agentAccount.addr.toString(),
    signTransactions: async (txns) => txns.map(t => algosdk.signTransaction(algosdk.decodeUnsignedTransaction(t), agentAccount.sk).blob)
  }));
  const payingFetch = wrapFetchWithPayment(fetch, client);

  // 3. Read Code / Manifest
  const code = fs.readFileSync(targetFile, 'utf-8');
  const filename = path.basename(targetFile);
  const ext = path.extname(targetFile).toLowerCase();

  let language = 'python';
  if (ext === '.ts' || ext === '.tsx') language = 'typescript';
  else if (ext === '.js' || ext === '.jsx') language = 'javascript';
  else if (ext === '.sol') language = 'solidity';
  else if (ext === '.go') language = 'go';
  else if (ext === '.rs') language = 'rust';

  try {
    const response = await payingFetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        filename,
        manifestContent: filename.includes('package') || filename.includes('pubspec') || filename.includes('requirements') ? code : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Medusa server error HTTP ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const score = Number(result.score ?? 100);
    const findings = result.findings || [];
    const criticalCount = findings.filter((f: any) => f.severity === 'critical').length;
    const highCount = findings.filter((f: any) => f.severity === 'high').length;
    const mediumCount = findings.filter((f: any) => f.severity === 'medium').length;

    // If score-only flag is requested (for shell scripts / CI parsing)
    if (scoreOnly) {
      console.log(score);
      process.exit(score >= minThreshold ? 0 : 1);
    }

    console.log(`\n======================================================`);
    console.log(`[+] MEDUSA CI/CD SECURITY SCORER: ${targetFile}`);
    console.log(`======================================================`);
    console.log(`Security Health Score : ${score} / 100`);
    console.log(`Required CI Threshold : ${minThreshold} / 100`);
    console.log(`Detected Hazards      : ${findings.length} issue(s) (${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium)`);

    if (findings.length > 0) {
      console.log(`\nKey Vulnerability Highlights:`);
      findings.slice(0, 3).forEach((f: any, i: number) => {
        console.log(`  [${i + 1}] ${f.cveId || f.cweId || 'VULN'}: ${f.title || f.description}`);
      });
    }

    console.log(`------------------------------------------------------`);
    if (score >= minThreshold) {
      console.log(`VERDICT: [PASS] Score ${score}/100 meets requirement (>= ${minThreshold}). CI/CD proceeding.`);
      console.log(`======================================================\n`);
      process.exit(0);
    } else {
      console.error(`VERDICT: [FAIL] Score ${score}/100 is BELOW requirement (< ${minThreshold}). CI/CD STOPPED.`);
      console.log(`======================================================\n`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('[!] Error executing scoring scan:', err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[!] Fatal error:', err);
  process.exit(1);
});
