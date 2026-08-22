import { AuditFinding, AuditRequest, AuditResponse } from './types';
import { calculateSummary } from './scoring';
import { scanSecrets } from './tier1/secrets';
import { scanPatterns } from './tier1/patterns';
import { scanTyposquatting } from './tier1/typosquat';
import { scanOsvVulnerabilities } from './tier1/osv';
import { generateUnifiedDiffs } from './tier2/diff-generator';
import { runSemanticLlmReview } from './tier2/llm';

export * from './types';
export * from './scoring';

const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export async function runAudit(req: AuditRequest): Promise<AuditResponse> {
  const startTime = Date.now();
  const code = req.code || '';
  const language = req.language;
  const tier = req.tier || 'tier1';
  const filename = req.filename || 'source_code';

  const findings: AuditFinding[] = [];

  // 1. Run Tier 1 Deterministic Scanners
  const secretFindings = scanSecrets(code);
  const patternFindings = scanPatterns(code, language);
  const typoFindings = scanTyposquatting(code);

  findings.push(...secretFindings, ...patternFindings, ...typoFindings);

  // 2. Query OSV.dev CVE Database
  try {
    const osvFindings = await scanOsvVulnerabilities(code, language, req.manifestContent);
    findings.push(...osvFindings);
  } catch {
    // OSV lookup error tolerated
  }

  // 3. Run Tier 2 LLM Review if requested
  if (tier === 'tier2') {
    try {
      const llmFindings = await runSemanticLlmReview(code, language);
      findings.push(...llmFindings);
    } catch {
      // LLM error tolerated
    }
  }

  // Sort findings by severity (Critical first) and line number
  findings.sort((a, b) => {
    const weightDiff = (SEVERITY_WEIGHTS[b.severity] || 0) - (SEVERITY_WEIGHTS[a.severity] || 0);
    if (weightDiff !== 0) return weightDiff;
    return (a.line || 0) - (b.line || 0);
  });

  // Deduplicate findings by title and line
  const uniqueFindings: AuditFinding[] = [];
  const seenKeys = new Set<string>();
  for (const f of findings) {
    const key = `${f.title}:${f.line}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueFindings.push(f);
    }
  }

  // 4. Generate Diff Fixes for Tier 2
  const fixes = tier === 'tier2' || uniqueFindings.length > 0
    ? generateUnifiedDiffs(code, uniqueFindings, filename)
    : undefined;

  const durationMs = Date.now() - startTime;
  const summary = calculateSummary(uniqueFindings, durationMs);

  return {
    success: true,
    tier,
    timestamp: new Date().toISOString(),
    summary,
    findings: uniqueFindings,
    fixes,
  };
}
