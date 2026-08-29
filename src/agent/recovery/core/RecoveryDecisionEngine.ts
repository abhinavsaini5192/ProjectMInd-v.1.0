import { FailureCategory } from '../classification/FailureCategory';
import { FailureSeverity } from '../classification/FailureSeverity';
import { RecoveryPlan, RecoveryStrategyType } from '../models/RecoveryPlan';

export class RecoveryDecisionEngine {
  public selectStrategy(
    category: FailureCategory, 
    severity: FailureSeverity, 
    attemptNumber: number, 
    maxAttempts: number,
    isPreExisting: boolean
  ): RecoveryPlan {
    
    if (isPreExisting) {
       return this.buildPlan(RecoveryStrategyType.NO_ACTION, category, severity, attemptNumber, maxAttempts, 'Failure was pre-existing');
    }

    if (attemptNumber >= maxAttempts) {
       return this.buildPlan(RecoveryStrategyType.ROLLBACK, category, severity, attemptNumber, maxAttempts, 'Max recovery attempts reached');
    }

    if (severity === FailureSeverity.CRITICAL) {
       return this.buildPlan(RecoveryStrategyType.ROLLBACK, category, severity, attemptNumber, maxAttempts, 'Critical failure necessitates immediate rollback');
    }

    if (category === FailureCategory.ENVIRONMENT_FAILURE) {
       return this.buildPlan(RecoveryStrategyType.RETRY, category, severity, attemptNumber, maxAttempts, 'Transient environment failure');
    }

    if (category === FailureCategory.CONFLICT) {
       return this.buildPlan(RecoveryStrategyType.ESCALATE, category, severity, attemptNumber, maxAttempts, 'Rollback or edit conflict detected');
    }

    // Default to REPAIR for syntax, type, test, build
    return this.buildPlan(RecoveryStrategyType.REPAIR, category, severity, attemptNumber, maxAttempts, 'Standard deterministic failure');
  }

  private buildPlan(strategy: RecoveryStrategyType, category: FailureCategory, severity: FailureSeverity, attemptNumber: number, maximumAttempts: number, reason: string): RecoveryPlan {
    return {
      strategy,
      failureCategory: category,
      severity,
      affectedFiles: [],
      affectedSymbols: [],
      reason,
      constraints: [],
      attemptNumber,
      maximumAttempts
    };
  }
}
