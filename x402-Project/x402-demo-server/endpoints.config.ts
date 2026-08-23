/**
 * X402 Hackathon Starter Kit - Endpoints Configuration
 *
 * This file defines all payment-protected endpoints for your x402 service.
 * Modify this file to add new endpoints or change payment requirements.
 *
 * QUICK START FOR TEAMS:
 * 1. Add a new entry below with your endpoint path and payment price
 * 2. Create a handler in handlers/ directory
 * 3. Import and register it in index.ts
 * 4. Test with curl: curl http://localhost:4021/your-endpoint
 */

import { ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } from '@x402/avm';
import { declareDiscoveryExtension } from '@x402-avm/extensions';

// Type definition for endpoints
export interface EndpointConfig {
  [key: string]: {
    accepts: Array<{
      scheme: 'exact';
      price: string;
      network: string;
      payTo: string;
      extra: { asset: number };
    }>;
    description: string;
    extensions?: Record<string, unknown>;
  };
}

/**
 * ENDPOINT TEMPLATES - Copy and modify for your ideas!
 *
 * Modify this based on your team's MVP idea:
 */
export function createPaymentConfig(avmAddress: string): EndpointConfig {
  return {
    /**
     * GREEN CARD 1: Pre-Flight Deterministic Scanner
     * Price: $0.001 USDC (1,000 microUSDC - super low test cost)
     */
    'POST /adsec/scan': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.001',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description: 'Medusa Security Node — Pre-Flight Scanner: Fast deterministic secrets, AST pattern flaws, typosquatting & live OSV.dev CVE checks ($0.001 USDC)',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { code: 'import os\napi_key = "sk-..."', language: 'python', filename: 'app.py' },
        inputSchema: {
          properties: {
            code: { type: 'string', description: 'Source code content to scan' },
            language: { type: 'string' },
            filename: { type: 'string' },
          },
          required: ['code'],
        },
        output: {
          example: {
            success: true,
            summary: { score: 85, totalIssues: 1, critical: 1, high: 0 },
            findings: [{ id: 'SEC-002', category: 'secret', severity: 'critical', title: 'Exposed API Key', line: 2 }],
          },
        },
      }),
    },

    /**
     * GREEN CARD 2: Language-Aware Git Diff Patch Generator
     * Price: $0.001 USDC
     */
    'POST /adsec/remediate': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.001',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description: 'Medusa Security Node — Auto-Remediation: Generates language-aware unified Git diff patches (git apply compatible) ($0.001 USDC)',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { code: 'api_key = "sk-..."', language: 'python', filename: 'app.py' },
        inputSchema: {
          properties: {
            code: { type: 'string' },
            language: { type: 'string' },
            filename: { type: 'string' },
          },
          required: ['code'],
        },
        output: {
          example: {
            success: true,
            fixes: [{ diff: '--- a/app.py\n+++ b/app.py\n@@ -1,1 +1,1 @@\n- api_key = "sk-..."\n+ api_key = os.environ.get("OPENAI_API_KEY")' }],
          },
        },
      }),
    },

    /**
     * GREEN CARD 3: On-Chain Cryptographic Audit Attestation
     * Price: $0.001 USDC
     */
    'POST /adsec/attest': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.001',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description: 'Medusa Security Node — On-Chain Attestation: Logs SHA-256 code hash and security audit proof to Algorand TestNet ($0.001 USDC)',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: { code: 'def safe(): pass', language: 'python', filename: 'app.py' },
        inputSchema: {
          properties: {
            code: { type: 'string' },
            language: { type: 'string' },
            filename: { type: 'string' },
          },
          required: ['code'],
        },
        output: {
          example: {
            success: true,
            attestation: {
              codeHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              score: 100,
              verifiedOnChain: true,
              txId: '0x4f9a2b8e...',
            },
          },
        },
      }),
    },

    /**
     * UNIFIED SUITE: Complete All-in-One Security Audit (Scan + Remediate + Attest)
     * Price: $0.001 USDC
     */
    'POST /adsec/audit': {
      accepts: [
        {
          scheme: 'exact',
          price: '$0.001',
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description: 'Medusa Security Node — Full AI & Deterministic Audit Suite: Complete Scan, Unified Git Diffs, and On-Chain Attestation ($0.001 USDC)',
      extensions: declareDiscoveryExtension({
        bodyType: 'json',
        input: {
          code: 'import os\napi_key = "sk-proj-abc..."',
          language: 'python',
          tier: 'tier2',
          filename: 'auth.py',
        },
        inputSchema: {
          properties: {
            code: { type: 'string', description: 'Source code content to audit' },
            language: { type: 'string', enum: ['python', 'javascript', 'typescript', 'solidity'] },
            tier: { type: 'string', enum: ['tier1', 'tier2'] },
            filename: { type: 'string' },
          },
          required: ['code'],
        },
        output: {
          example: {
            success: true,
            summary: { score: 75, totalIssues: 2, critical: 1, high: 1 },
            findings: [
              {
                id: 'SEC-002',
                category: 'secret',
                severity: 'critical',
                title: 'Exposed OpenAI API Key',
                line: 2,
              },
            ],
            fixes: [
              {
                diff: '--- a/auth.py\n+++ b/auth.py\n@@ -2,1 +2,1 @@\n- api_key = "..."\n+ api_key = os.environ.get("OPENAI_KEY")',
              },
            ],
          },
        },
      }),
    },
  };
}

export default createPaymentConfig;

