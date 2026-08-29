import { ActionPlan } from '../models/ActionPlan';

export class ExecutionSafetyValidator {
  public validate(plan: ActionPlan): { safe: boolean; issues: string[] } {
    const issues: string[] = [];

    for (const step of plan.steps || []) {
      // Ensure no raw shell execution or direct executable payloads are embedded in descriptions
      const descLower = step.description.toLowerCase();
      if (descLower.includes('rm -rf') || descLower.includes('drop table') || descLower.includes('eval(')) {
        issues.push(`Unsafe executable shell command string found in step ${step.stepId}`);
      }
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }
}
