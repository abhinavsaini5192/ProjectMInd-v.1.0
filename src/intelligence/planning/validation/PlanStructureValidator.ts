import { ActionPlan } from '../models/ActionPlan';

export class PlanStructureValidator {
  public validate(plan: ActionPlan): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!plan.planId) issues.push('Missing planId');
    if (!plan.decisionId) issues.push('Missing decisionId');
    if (!plan.taskId) issues.push('Missing taskId');

    if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
      issues.push('ActionPlan must contain at least one action step');
    } else {
      const stepIds = new Set<string>();
      for (const step of plan.steps) {
        if (!step.stepId) {
          issues.push('ActionStep missing stepId');
        } else if (stepIds.has(step.stepId)) {
          issues.push(`Duplicate stepId detected: "${step.stepId}"`);
        } else {
          stepIds.add(step.stepId);
        }

        if (!step.type) issues.push(`Step ${step.stepId} missing type`);
        if (!step.description) issues.push(`Step ${step.stepId} missing description`);
        if (!step.target || !step.target.id) issues.push(`Step ${step.stepId} missing valid target`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
