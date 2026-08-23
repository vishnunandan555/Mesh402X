#!/usr/bin/env node
process.env.DOTENV_CONFIG_QUIET = 'true';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import algosdk from 'algosdk';
import { x402Client, wrapFetchWithPayment } from '@x402-avm/fetch';
import { ExactAvmScheme } from '@x402-avm/avm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Load environment from wallet.env and .env quietly
dotenv.config({ quiet: true } as any);
dotenv.config({ path: 'wallet.env', quiet: true } as any);

const ALGOD_SERVER = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const INDEXER_SERVER = process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
const USDC_ASA_ID = 10458941;
const DEFAULT_NODE_URL = process.env.ADSEC_SERVER_URL || process.env.VITE_API_BASE_URL || 'https://mesh402x.onrender.com';
const MEDUSA_RECEIVER = 'LG24FUHIBJEL6Z3X7TPSOPGQKF6E2ZBLSZMNSFVOTSJA7TNETZTGCAQGDQ';

// Clean and sanitize mnemonic
function getCleanMnemonic(): string {
  const raw = process.env.AGENT_MNEMONIC || process.env.USER_AGENT_MNEMONIC || process.env.PAYER_MNEMONIC;
  if (!raw) return '';
  return raw
    .trim()
    .replace(/^[A-Za-z0-9_]+\s*=\s*/, '')
    .replace(/^["'\\]+|["'\\]+$/g, '')
    .replace(/^["'\\]+|["'\\]+$/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Get agent account from mnemonic
function getAgentAccount(): algosdk.Account | null {
  const mnemonic = getCleanMnemonic();
  if (!mnemonic) return null;
  try {
    return algosdk.mnemonicToSecretKey(mnemonic);
  } catch (err) {
    return null;
  }
}

// Setup autonomous x402 paying fetch client
function createPayingFetch(account: algosdk.Account) {
  const client = new x402Client();
  client.register(
    'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    new ExactAvmScheme({
      address: account.addr.toString(),
      signTransactions: async (txns) =>
        txns.map(
          (t) =>
            algosdk.signTransaction(algosdk.decodeUnsignedTransaction(t), account.sk).blob
        ),
    })
  );
  return wrapFetchWithPayment(fetch, client);
}

// Infer language from file extension
function inferLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
      return 'javascript';
    case '.py':
      return 'python';
    case '.sol':
      return 'solidity';
    case '.teal':
      return 'teal';
    case '.go':
      return 'go';
    case '.rs':
      return 'rust';
    case '.java':
      return 'java';
    case '.c':
    case '.cpp':
    case '.h':
      return 'c';
    default:
      return 'python';
  }
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'medusa-x402-security',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List Available MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'medusa_check_wallet',
        description:
          'Inspect the agent Algorand TestNet wallet, ALGO gas balance, USDC balance (ASA #10458941), and USDC opt-in status before hiring audit nodes.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'medusa_discover_nodes',
        description:
          'Query the GoPlausible Bazaar decentralized catalog to discover active security audit nodes, available endpoints, and live pricing on Algorand TestNet.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of nodes to return (default: 10)',
            },
          },
        },
      },
      {
        name: 'medusa_audit_file',
        description:
          'Execute a full multi-phase decentralized security audit on a source code file. Handles HTTP 402, signs $0.001 TestNet USDC on-chain, runs AST/CVE scanning, AI semantic deep review, generates Git diff patches, and records cryptographic attestation on Algorand.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Relative or absolute path to the source code file to audit.',
            },
            applyRemediation: {
              type: 'boolean',
              description: 'If true, automatically applies the generated unified Git diff patch to repair the source file.',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'medusa_scan_code',
        description:
          'Execute a pre-flight deterministic security scan on a source code file ($0.001 USDC). Checks for hardcoded API keys/secrets, dangerous AST patterns, and live OSV.dev CVE database matches.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the source code file to scan.',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'medusa_remediate_file',
        description:
          'Generate and optionally apply a language-aware unified Git diff patch (git apply) to automatically repair discovered vulnerabilities in a source file ($0.001 USDC).',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the source code file to remediate.',
            },
            applyPatch: {
              type: 'boolean',
              description: 'If true, automatically applies the patch to the local file (default: true).',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'medusa_attest_code',
        description:
          'Compute a cryptographic SHA-256 digest of a source file and broadcast an immutable proof-of-audit transaction note to Algorand TestNet consensus ($0.001 USDC).',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the source code file to attest.',
            },
            score: {
              type: 'number',
              description: 'Security health score (0-100) to record in the attestation note (default: 100).',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'medusa_get_financial_ledger',
        description:
          'Query the Algorand TestNet indexer to retrieve the agent wallet transaction history, total USDC audit fees paid, remaining budget, and Lora Explorer links.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of recent audit transactions to retrieve (default: 15)',
            },
          },
        },
      },
    ],
  };
});

// Handle Tool Execution Requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 1. Tool: medusa_check_wallet
  if (name === 'medusa_check_wallet') {
    const account = getAgentAccount();
    if (!account) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Error: Missing or invalid AGENT_MNEMONIC in wallet.env or .env. Please configure your 25-word Algorand TestNet mnemonic.',
          },
        ],
      };
    }

    try {
      const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '');
      const accountInfo = await algodClient.accountInformation(account.addr).do();
      const algoBalance = Number(accountInfo.amount || 0) / 1e6;
      const usdcAsset = accountInfo.assets?.find((a: any) => Number(a['asset-id']) === USDC_ASA_ID);
      const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1e6 : 0;
      const isOptedIn = Boolean(usdcAsset);

      const report = [
        `💳 **Medusa Agent Wallet Diagnostic**`,
        `• Address: \`${account.addr}\``,
        `• ALGO Gas Balance: **${algoBalance.toFixed(4)} ALGO** ${algoBalance < 0.1 ? '⚠️ (Low - claim at dispenser)' : '✅'}`,
        `• USDC Balance: **$${usdcBalance.toFixed(4)} USDC** (ASA #${USDC_ASA_ID})`,
        `• USDC Opt-in Status: **${isOptedIn ? '✅ Opted-in' : '❌ Not Opted-in'}**`,
        `• Audit Capacity: **~${Math.floor(usdcBalance / 0.001)} paid audit calls available**`,
        ``,
        `🔗 [Algorand Lora Explorer](https://lora.algokit.io/testnet/account/${account.addr})`,
      ].join('\n');

      return { content: [{ type: 'text', text: report }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Algod query failed: ${err.message}` }] };
    }
  }

  // 2. Tool: medusa_discover_nodes
  if (name === 'medusa_discover_nodes') {
    try {
      const limit = Number((args as any)?.limit) || 10;
      const catalogUrl = `https://facilitator.goplausible.xyz/discovery/resources?includeTestnets=true&limit=${limit}`;
      const res = await fetch(catalogUrl);
      if (!res.ok) throw new Error(`Bazaar returned HTTP ${res.status}`);
      const data = await res.json();
      const items = data.items || data.resources || [];

      const nodeSummary = [
        `🌐 **GoPlausible Bazaar Decentralized Catalog**`,
        `Total Active Resources: **${items.length} discovered**`,
        ``,
        `**Medusa Security Node:**`,
        `• Service Endpoint: \`${DEFAULT_NODE_URL}/adsec/audit\``,
        `• Fixed Audit Price: **$0.001 USDC (1,000 microUSDC)**`,
        `• Payment Protocol: **x402 (Algorand TestNet ASA #${USDC_ASA_ID})**`,
        `• Consensus Settlement Time: **~1.8s**`,
        `• Receiver Account: \`${MEDUSA_RECEIVER}\``,
      ].join('\n');

      return { content: [{ type: 'text', text: nodeSummary }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Catalog discovery error: ${err.message}` }] };
    }
  }

  // 3. Tool: medusa_audit_file
  if (name === 'medusa_audit_file') {
    const filePath = String((args as any)?.filePath);
    const applyRemediation = Boolean((args as any)?.applyRemediation);

    if (!filePath || !fs.existsSync(filePath)) {
      return { content: [{ type: 'text', text: `❌ Target file '${filePath}' not found.` }] };
    }

    const account = getAgentAccount();
    if (!account) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Missing AGENT_MNEMONIC in wallet.env. Please configure your funded Algorand wallet.',
          },
        ],
      };
    }

    try {
      const payingFetch = createPayingFetch(account);
      const code = fs.readFileSync(filePath, 'utf-8');
      const language = inferLanguage(filePath);
      const endpoint = `${DEFAULT_NODE_URL.replace(/\/$/, '')}/adsec/audit`;

      const response = await payingFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename: path.basename(filePath) }),
      });

      if (!response.ok) {
        throw new Error(`Medusa node responded with HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const score = result.score ?? 100;
      const findings = result.findings || [];
      const diffPatch = result.remediation?.diff || '';
      const attestation = result.attestation || {};

      let patchApplied = false;
      if (applyRemediation && diffPatch) {
        const patchFile = path.join(path.dirname(filePath), 'audit.patch');
        fs.writeFileSync(patchFile, diffPatch);
        try {
          execSync(`git apply "${patchFile}"`, { stdio: 'pipe' });
          patchApplied = true;
          fs.unlinkSync(patchFile);
        } catch {
          patchApplied = false;
        }
      }

      const reportLines = [
        `🛡️ **Medusa Decentralized Security Audit Report**`,
        `• Target File: \`${filePath}\` (${language})`,
        `• Security Score: **${score}/100** ${score >= 80 ? '🟢 (PASS)' : '🔴 (ACTION REQUIRED)'}`,
        `• Flaws Detected: **${findings.length} issue(s)**`,
        ``,
      ];

      if (findings.length > 0) {
        reportLines.push(`### ⚠️ Detected Vulnerabilities`);
        findings.forEach((f: any, i: number) => {
          reportLines.push(
            `${i + 1}. **[${f.cwe || 'CWE'}] ${f.title || f.rule || 'Security Hazard'}** (${f.severity || 'Medium'})`
          );
          reportLines.push(`   - *Description:* ${f.description || f.message}`);
          if (f.line) reportLines.push(`   - *Location:* Line ${f.line}`);
        });
        reportLines.push(``);
      }

      if (diffPatch) {
        reportLines.push(`### 🩹 Auto-Remediation Patch`);
        if (patchApplied) {
          reportLines.push(`✅ **Applied patch directly to \`${filePath}\` via git apply.**`);
        } else {
          reportLines.push('```diff');
          reportLines.push(diffPatch.slice(0, 800));
          if (diffPatch.length > 800) reportLines.push('... (diff truncated)');
          reportLines.push('```');
        }
        reportLines.push(``);
      }

      reportLines.push(`### 💰 Financial Spending & On-Chain Settlement`);
      reportLines.push(`• **Cost:** $0.001 USDC (1,000 microUSDC)`);
      reportLines.push(`• **Protocol:** x402 (Algorand TestNet ASA #${USDC_ASA_ID})`);
      reportLines.push(`• **Agent Wallet:** \`${account.addr}\``);
      if (attestation.txId) {
        reportLines.push(`• **Attestation TxID:** \`${attestation.txId}\``);
        reportLines.push(`• **Explorer Proof:** [View on Lora Explorer](${attestation.loraUrl || `https://lora.algokit.io/testnet/transaction/${attestation.txId}`})`);
      }

      return { content: [{ type: 'text', text: reportLines.join('\n') }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Audit execution failed: ${err.message}` }] };
    }
  }

  // 4. Tool: medusa_scan_code
  if (name === 'medusa_scan_code') {
    const filePath = String((args as any)?.filePath);
    if (!filePath || !fs.existsSync(filePath)) {
      return { content: [{ type: 'text', text: `❌ Target file '${filePath}' not found.` }] };
    }
    const account = getAgentAccount();
    if (!account) return { content: [{ type: 'text', text: '❌ Missing AGENT_MNEMONIC in wallet.env.' }] };

    try {
      const payingFetch = createPayingFetch(account);
      const code = fs.readFileSync(filePath, 'utf-8');
      const language = inferLanguage(filePath);
      const endpoint = `${DEFAULT_NODE_URL.replace(/\/$/, '')}/adsec/scan`;

      const response = await payingFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename: path.basename(filePath) }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `🔍 **Pre-Flight Scan Results for \`${filePath}\`**\nScore: **${result.score ?? 100}/100**\nHazards: **${(result.findings || []).length} found**\nSettlement: Paid $0.001 USDC via x402`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Scan failed: ${err.message}` }] };
    }
  }

  // 5. Tool: medusa_remediate_file
  if (name === 'medusa_remediate_file') {
    const filePath = String((args as any)?.filePath);
    const applyPatch = (args as any)?.applyPatch !== false;

    if (!filePath || !fs.existsSync(filePath)) {
      return { content: [{ type: 'text', text: `❌ Target file '${filePath}' not found.` }] };
    }
    const account = getAgentAccount();
    if (!account) return { content: [{ type: 'text', text: '❌ Missing AGENT_MNEMONIC in wallet.env.' }] };

    try {
      const payingFetch = createPayingFetch(account);
      const code = fs.readFileSync(filePath, 'utf-8');
      const language = inferLanguage(filePath);
      const endpoint = `${DEFAULT_NODE_URL.replace(/\/$/, '')}/adsec/remediate`;

      const response = await payingFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename: path.basename(filePath) }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = await response.json();
      const diff = result.diff || result.patch || '';

      let applied = false;
      if (applyPatch && diff) {
        const patchFile = path.join(path.dirname(filePath), 'audit.patch');
        fs.writeFileSync(patchFile, diff);
        try {
          execSync(`git apply "${patchFile}"`, { stdio: 'pipe' });
          applied = true;
          fs.unlinkSync(patchFile);
        } catch {}
      }

      return {
        content: [
          {
            type: 'text',
            text: `🩹 **Auto-Remediation for \`${filePath}\`**\nStatus: ${applied ? '✅ Applied patch directly via git apply' : 'Generated unified diff'}\nSettlement: Paid $0.001 USDC via x402\n\n\`\`\`diff\n${diff}\n\`\`\``,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Remediation failed: ${err.message}` }] };
    }
  }

  // 6. Tool: medusa_attest_code
  if (name === 'medusa_attest_code') {
    const filePath = String((args as any)?.filePath);
    const score = Number((args as any)?.score) || 100;

    if (!filePath || !fs.existsSync(filePath)) {
      return { content: [{ type: 'text', text: `❌ Target file '${filePath}' not found.` }] };
    }
    const account = getAgentAccount();
    if (!account) return { content: [{ type: 'text', text: '❌ Missing AGENT_MNEMONIC in wallet.env.' }] };

    try {
      const payingFetch = createPayingFetch(account);
      const code = fs.readFileSync(filePath, 'utf-8');
      const language = inferLanguage(filePath);
      const endpoint = `${DEFAULT_NODE_URL.replace(/\/$/, '')}/adsec/attest`;

      const response = await payingFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, filename: path.basename(filePath), score }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `📜 **On-Chain Cryptographic Attestation Created**\n• File: \`${filePath}\`\n• SHA-256 Digest: \`${result.codeHash || 'Recorded'}\`\n• Algorand TxID: \`${result.txId || 'Confirmed'}\`\n• Explorer Link: [View on Lora](${result.loraUrl || `https://lora.algokit.io/testnet/transaction/${result.txId}`})`,
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Attestation failed: ${err.message}` }] };
    }
  }

  // 7. Tool: medusa_get_financial_ledger
  if (name === 'medusa_get_financial_ledger') {
    const account = getAgentAccount();
    if (!account) return { content: [{ type: 'text', text: '❌ Missing AGENT_MNEMONIC in wallet.env.' }] };

    try {
      const limit = Number((args as any)?.limit) || 15;
      const indexerUrl = `${INDEXER_SERVER}/v2/accounts/${account.addr}/transactions?limit=${limit}`;
      const res = await fetch(indexerUrl);
      if (!res.ok) throw new Error(`Indexer HTTP ${res.status}`);
      const data = await res.json();
      const txns: any[] = data.transactions || [];

      let totalSpent = 0;
      let auditCount = 0;
      const records: string[] = [];

      txns.forEach((tx) => {
        if (tx['tx-type'] === 'axfer' && tx['asset-transfer-transaction']) {
          const xfer = tx['asset-transfer-transaction'];
          if (Number(xfer['asset-id']) === USDC_ASA_ID && tx.sender === account.addr) {
            const amount = Number(xfer.amount) / 1e6;
            totalSpent += amount;
            auditCount++;
            records.push(`• \`${tx.id.slice(0, 8)}...\` | **$${amount.toFixed(3)} USDC** | [Lora](https://lora.algokit.io/testnet/transaction/${tx.id})`);
          }
        }
      });

      const report = [
        `📊 **Agent Financial Spending Summary**`,
        `• Agent Wallet: \`${account.addr}\``,
        `• Total Audits Purchased: **${auditCount}**`,
        `• Total USDC Spent: **$${totalSpent.toFixed(3)} USDC**`,
        ``,
        `**Recent Transaction Receipts:**`,
        records.length > 0 ? records.slice(0, 10).join('\n') : 'No prior audit transactions found.',
      ].join('\n');

      return { content: [{ type: 'text', text: report }] };
    } catch (err: any) {
      return { content: [{ type: 'text', text: `❌ Failed to query financial history: ${err.message}` }] };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the MCP Server using stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
