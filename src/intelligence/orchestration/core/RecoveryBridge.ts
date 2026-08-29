import { ActionPlan } from '../../planning/models/ActionPlan';
import { VerificationBridgeReport } from './VerificationBridge';

export interface RecoveryAction {
  strategy: 'RETRY' | 'ROLLBACK' | 'REQUEST_USER_INTERVENTION';
  reason: string;
  rollbackRequired: boolean;
}

export class RecoveryBridge {
  public evaluateFailure(
    plan: ActionPlan,
    verification: VerificationBridgeReport,
    iteration: number,
    maxIterations: number
  ): RecoveryAction {
    if (iteration >= maxIterations) {
      return {
        strategy: 'ROLLBACK',
        reason: `Exceeded maximum iteration budget (${maxIterations}) without passing verification`,
        rollbackRequired: true
      };
    }

    const hasSevereFailure = verification.failures.some(f => f.includes('Unrecoverable') || f.includes('Corruption'));
    if (hasSevereFailure) {
      return {
        strategy: 'ROLLBACK',
        reason: 'Severe or unrecoverable verification failure detected',
        rollbackRequired: true
      };
    }

    return {
      strategy: 'RETRY',
      reason: `Transient verification failure: ${verification.failures.join(', ')}. Triggering repair iteration.`,
      rollbackRequired: false
    };
  }
}
