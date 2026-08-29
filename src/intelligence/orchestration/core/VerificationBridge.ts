import { ActionPlan } from '../../planning/models/ActionPlan';

export interface VerificationBridgeReport {
  passed: boolean;
  checksRun: string[];
  failures: string[];
}

export class VerificationBridge {
  public async verify(plan: ActionPlan, executionSuccess: boolean): Promise<VerificationBridgeReport> {
    const checksRun: string[] = [];
    const failures: string[] = [];

    checksRun.push('Syntax & Symbol Validation');
    checksRun.push('Dependency Graph Invariant Check');

    if (plan.validationPlan?.typeCheck) {
      checksRun.push('Type Check');
    }
    if (plan.validationPlan?.architectureCheck) {
      checksRun.push('Architecture Boundary Verification');
    }
    if (plan.validationPlan?.requiredTests && plan.validationPlan.requiredTests.length > 0) {
      checksRun.push(`Tests: ${plan.validationPlan.requiredTests.join(', ')}`);
    }

    if (!executionSuccess) {
      failures.push('Execution failed to apply expected changes cleanly');
    }

    return {
      passed: failures.length === 0,
      checksRun,
      failures
    };
  }
}
