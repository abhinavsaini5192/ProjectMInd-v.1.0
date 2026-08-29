import { ActionPlan } from '../../planning/models/ActionPlan';
import { OrchestrationPolicy } from '../policies/OrchestrationPolicy';

export class ApprovalGuard {
  public requiresApproval(plan: ActionPlan, policy: OrchestrationPolicy): boolean {
    if (!policy.requireApprovalForHighRisk) return false;

    // Any plan containing DELETE / high-risk operations requires explicit approval
    const hasHighRisk = plan.steps.some(s =>
      s.type === 'DELETE' ||
      (s as any).action === 'DELETE' ||
      s.riskLevel === 'CRITICAL' ||
      s.riskLevel === 'HIGH' ||
      (s.risks && s.risks.some(r => (r as any).severity === 'CRITICAL' || (r as any).severity === 'HIGH'))
    ) || (plan.risks && plan.risks.some((r: any) => r.level === 'HIGH' || r.level === 'CRITICAL' || r.severity === 'HIGH' || r.severity === 'CRITICAL'));

    const isExplicitlyFlagged = plan.status === 'NEEDS_APPROVAL';

    return hasHighRisk || isExplicitlyFlagged;
  }
}
