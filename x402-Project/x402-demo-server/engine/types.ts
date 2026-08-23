/**
 * ADSEC Security Audit Engine - Type Definitions & Interface Contract
 */

export type AuditLanguage = 'javascript' | 'typescript' | 'python' | 'solidity' | 'json' | 'text';
export type AuditTier = 'tier1' | 'tier2';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingCategory = 
  | 'secret'
  | 'vulnerability'
  | 'dangerous-pattern'
  | 'typosquat'
  | 'outdated-dep'
  | 'semantic-logic';

export interface AuditRequest {
  code: string;
  language?: AuditLanguage;
  tier?: AuditTier;
  filename?: string;
  manifestContent?: string;
}

export interface AuditFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  line?: number;
  lineEnd?: number;
  snippet?: string;
  remediation: string;
  cveId?: string;
  cweId?: string;
  packageName?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AuditDiffFix {
  findingId: string;
  filePath?: string;
  diff: string; // Unified diff format (--- a/file +++ b/file)
  explanation: string;
}

export interface AuditSummary {
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  score: number; // 0 - 100 Security Health Score
  durationMs: number;
}

export interface AuditResponse {
  success: boolean;
  tier: AuditTier;
  timestamp: string;
  summary: AuditSummary;
  findings: AuditFinding[];
  fixes?: AuditDiffFix[];
  attestation?: {
    codeHash: string;
    score: number;
    status: string;
    totalIssues: number;
    timestamp: string;
    attestationAuthority?: string;
    txNoteSchema: string;
    txId?: string;
    loraUrl?: string;
  };
  receipt?: {
    txId?: string;
    network?: string;
    paidAmount?: string;
    timestamp?: string;
    attestationTxId?: string;
    loraUrl?: string;
  };
}
