import { ActionPlan } from '../models/ActionPlan';

export class RiskValidator {
  public validate(plan: ActionPlan): { requiresApproval: boolean; risks: string[] } {
    const highRisks: string[] = [];

    for (const step of plan.steps || []) {
      if (step.type === 'DELETE') {
        highRisks.push(`Step ${step.stepId} performs destructive deletion on ${step.target.id}`);
      }
      if (step.riskLevel === 'CRITICAL' || step.riskLevel === 'HIGH') {
        highRisks.push(`Step ${step.stepId} has elevated risk level: ${step.riskLevel}`);
      }
      if (step.reversibility === 'IRREVERSIBLE') {
        highRisks.push(`Step ${step.stepId} is irreversible`);
      }
    }

    for (const r of plan.risks || []) {
      if (r.level === 'CRITICAL' || r.level === 'HIGH') {
        highRisks.push(...r.factors);
      }
    }

    return {
      requiresApproval: highRisks.length > 0,
      risks: highRisks
    };
  }
}
