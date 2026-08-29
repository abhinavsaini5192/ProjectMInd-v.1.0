import { CheckResult, CheckStatus } from '../models/CheckResult';

export class VerificationConfidence {
  public calculate(checks: CheckResult[]): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
    if (checks.length === 0) return 'NONE';

    let totalWeight = 0;
    let earnedWeight = 0;

    const weights: Record<string, number> = {
       'SYNTAX': 3,
       'TYPE': 3,
       'TEST': 2,
       'BUILD': 2,
       'FILE': 1,
       'SYMBOL': 1,
       'DEPENDENCY': 1,
       'ARCHITECTURE': 1,
       'TASK_OUTCOME': 2
    };

    let hasFailures = false;

    for (const check of checks) {
       const weight = weights[check.type] || 1;
       totalWeight += weight;

       if (check.status === CheckStatus.PASS) {
          earnedWeight += weight;
       } else if (check.status === CheckStatus.PARTIAL) {
          earnedWeight += (weight * 0.5);
       } else if (check.status === CheckStatus.FAIL) {
          hasFailures = true;
       }
       // SKIPPED/BLOCKED earn 0, penalizing confidence
    }

    if (totalWeight === 0) return 'NONE';
    const score = earnedWeight / totalWeight;

    // Failures hardcap confidence at LOW
    if (hasFailures) return 'LOW';
    if (score >= 0.9) return 'HIGH';
    if (score >= 0.6) return 'MEDIUM';
    return 'LOW';
  }
}
