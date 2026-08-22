import { AuditFinding, AuditSummary } from './types';

/**
 * Calculates security health score and summary metrics from audit findings.
 * Score starts at 100 and applies weighted deductions based on finding severity.
 */
export function calculateSummary(findings: AuditFinding[], durationMs: number): AuditSummary {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const f of findings) {
    switch (f.severity) {
      case 'critical':
        critical++;
        break;
      case 'high':
        high++;
        break;
      case 'medium':
        medium++;
        break;
      case 'low':
        low++;
        break;
    }
  }

  // Calculate deductions: Critical = -25, High = -15, Medium = -7, Low = -2
  const deduction = (critical * 25) + (high * 15) + (medium * 7) + (low * 2);
  const score = Math.max(0, 100 - deduction);

  return {
    totalIssues: findings.length,
    critical,
    high,
    medium,
    low,
    score,
    durationMs,
  };
}
