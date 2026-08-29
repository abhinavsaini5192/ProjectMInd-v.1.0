import { ValidationIssue } from '../models/ValidationIssue';
import { Severity } from '../models/Severity';

export class HealthCalculator {
  public calculate(issues: ValidationIssue[]): { score: number, status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' } {
    let score = 1.0;

    let hasCritical = false;
    let hasError = false;

    for (const issue of issues) {
      if (issue.severity === Severity.CRITICAL) {
        score -= 0.5;
        hasCritical = true;
      } else if (issue.severity === Severity.ERROR) {
        score -= 0.1;
        hasError = true;
      } else if (issue.severity === Severity.WARNING) {
        score -= 0.02;
      }
    }

    score = Math.max(0.0, score);

    let status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (hasCritical || score < 0.5) {
      status = 'CRITICAL';
    } else if (hasError || score < 0.95) {
      status = 'DEGRADED';
    }

    return { score, status };
  }
}
