import { ActionPlan } from '../models/ActionPlan';
import { PlanStatus } from '../models/PlanStatus';
import { PlanStructureValidator } from './PlanStructureValidator';
import { DependencyValidator } from './DependencyValidator';
import { PreconditionsValidator } from './PreconditionsValidator';
import { RiskValidator } from './RiskValidator';
import { ExecutionSafetyValidator } from './ExecutionSafetyValidator';

export interface PlanValidationReport {
  status: PlanStatus;
  valid: boolean;
  issues: string[];
  requiresApproval: boolean;
  approvalReasons: string[];
}

export class PlanValidator {
  private structureValidator = new PlanStructureValidator();
  private dependencyValidator = new DependencyValidator();
  private preconditionsValidator = new PreconditionsValidator();
  private riskValidator = new RiskValidator();
  private safetyValidator = new ExecutionSafetyValidator();

  public validate(
    plan: ActionPlan,
    currentKnowledgeState?: { knowledgeVersion?: string; symbols?: string[]; files?: string[] }
  ): PlanValidationReport {
    const issues: string[] = [];

    // 1. Staleness check
    if (currentKnowledgeState?.knowledgeVersion && plan.knowledgeVersion) {
      if (currentKnowledgeState.knowledgeVersion !== plan.knowledgeVersion) {
        return {
          status: 'STALE',
          valid: false,
          issues: [`Plan is based on knowledge version ${plan.knowledgeVersion}, but current version is ${currentKnowledgeState.knowledgeVersion}`],
          requiresApproval: false,
          approvalReasons: []
        };
      }
    }

    // 2. Structure check
    const structRes = this.structureValidator.validate(plan);
    if (!structRes.valid) issues.push(...structRes.issues);

    // 3. Dependency DAG check
    const depRes = this.dependencyValidator.validate(plan);
    if (!depRes.valid) issues.push(...depRes.issues);

    // 4. Precondition check
    const preRes = this.preconditionsValidator.validate(plan, currentKnowledgeState);
    if (!preRes.valid) issues.push(...preRes.issues);

    // 5. Safety check
    const safeRes = this.safetyValidator.validate(plan);
    if (!safeRes.safe) issues.push(...safeRes.issues);

    if (issues.length > 0) {
      return {
        status: 'INVALIDATED',
        valid: false,
        issues,
        requiresApproval: false,
        approvalReasons: []
      };
    }

    // 6. Risk check -> determines if approval is required
    const riskRes = this.riskValidator.validate(plan);
    const finalStatus: PlanStatus = riskRes.requiresApproval ? 'NEEDS_APPROVAL' : 'VALIDATED';

    return {
      status: finalStatus,
      valid: true,
      issues: [],
      requiresApproval: riskRes.requiresApproval,
      approvalReasons: riskRes.risks
    };
  }
}
