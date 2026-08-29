import { ActionPlan } from '../../planning/models/ActionPlan';
import { ExecutionResult } from '../../../agent/execution/models/ExecutionResult';
import { ExecutionBridge } from '../core/ExecutionBridge';

export class ExecutionAdapter {
  private bridge = new ExecutionBridge();

  public async execute(plan: ActionPlan, dryRun: boolean = false): Promise<ExecutionResult> {
    if (dryRun) {
      return {
        executionId: `exec_dryrun_${Date.now()}`,
        status: 'SUCCEEDED' as any,
        changes: plan.steps.map(s => ({ path: s.target.id, type: 'MODIFIED' })),
        succeeded: plan.steps.length,
        failed: 0,
        errors: [],
        warnings: ['Dry-run executed without modifying files']
      } as any;
    }

    const bridgeResult = await this.bridge.executePlan(plan);
    return {
      executionId: bridgeResult.executionId,
      status: bridgeResult.success ? ('SUCCEEDED' as any) : ('FAILED' as any),
      changes: plan.steps.map(s => ({ path: s.target.id, type: 'MODIFIED' })),
      succeeded: bridgeResult.success ? plan.steps.length : 0,
      failed: bridgeResult.errors.length,
      errors: bridgeResult.errors,
      warnings: []
    } as any;
  }
}
