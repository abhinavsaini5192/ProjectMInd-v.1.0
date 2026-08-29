import { CheckResult, CheckStatus } from '../models/CheckResult';

export class VerificationPlanner {
  public determineChecks(changedFiles: string[], impactFlags: string[]): string[] {
    const checks = ['FILE', 'SYNTAX', 'TASK_OUTCOME'];

    if (impactFlags.includes('PUBLIC_API') || changedFiles.some(f => f.endsWith('.ts'))) {
       checks.push('TYPE');
       checks.push('TEST');
    }

    if (impactFlags.includes('ARCHITECTURE_BOUNDARIES')) {
       checks.push('ARCHITECTURE');
       checks.push('DEPENDENCY');
    }

    return checks;
  }
}
