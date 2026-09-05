export type FailureCategory =
  | 'USER_ERROR'
  | 'MODEL_ERROR'
  | 'CONTEXT_ERROR'
  | 'PLANNING_ERROR'
  | 'POLICY_ERROR'
  | 'EXECUTION_ERROR'
  | 'VERIFICATION_ERROR'
  | 'ENVIRONMENT_ERROR'
  | 'RESOURCE_ERROR'
  | 'TIMEOUT'
  | 'BUDGET_EXCEEDED'
  | 'SECURITY_ERROR'
  | 'SYSTEM_ERROR';

export type RecoveryAction =
  | 'RETRY_WITH_BACKOFF'
  | 'RETRY_WITH_REDUCED_CONTEXT'
  | 'FALLBACK_MODEL'
  | 'REPAIR_PLAN'
  | 'REQUEST_USER_INTERVENTION'
  | 'ROLLBACK'
  | 'ABORT';

export interface FailureRecord {
  category: FailureCategory;
  message: string;
  code?: string;
  sourceComponent: string;
  timestamp: number;
  fatal: boolean;
  recoveryAction: RecoveryAction;
  metadata?: Record<string, any>;
}

export class FailureTaxonomy {
  private static readonly DEFAULT_RECOVERY_MATRIX: Record<FailureCategory, RecoveryAction> = {
    USER_ERROR: 'REQUEST_USER_INTERVENTION',
    MODEL_ERROR: 'FALLBACK_MODEL',
    CONTEXT_ERROR: 'RETRY_WITH_REDUCED_CONTEXT',
    PLANNING_ERROR: 'REPAIR_PLAN',
    POLICY_ERROR: 'REQUEST_USER_INTERVENTION',
    EXECUTION_ERROR: 'ROLLBACK',
    VERIFICATION_ERROR: 'REPAIR_PLAN',
    ENVIRONMENT_ERROR: 'RETRY_WITH_BACKOFF',
    RESOURCE_ERROR: 'ABORT',
    TIMEOUT: 'ABORT',
    BUDGET_EXCEEDED: 'ABORT',
    SECURITY_ERROR: 'ABORT',
    SYSTEM_ERROR: 'ABORT',
  };

  /**
   * Classify any caught error or failure into a standardized FailureRecord
   */
  public static classify(
    error: unknown,
    sourceComponent: string,
    overrideCategory?: FailureCategory
  ): FailureRecord {
    const message = error instanceof Error ? error.message : String(error);
    const category = overrideCategory || this.inferCategory(error);
    const fatal = this.isFatal(category);
    const recoveryAction = this.DEFAULT_RECOVERY_MATRIX[category];

    return {
      category,
      message,
      code: (error as any)?.code || (error as any)?.name || 'UNKNOWN_ERROR',
      sourceComponent,
      timestamp: Date.now(),
      fatal,
      recoveryAction,
      metadata: (error as any)?.metadata || undefined,
    };
  }

  public static getRecoveryAction(category: FailureCategory): RecoveryAction {
    return this.DEFAULT_RECOVERY_MATRIX[category] || 'ABORT';
  }

  public static isFatal(category: FailureCategory): boolean {
    return (
      category === 'SECURITY_ERROR' ||
      category === 'RESOURCE_ERROR' ||
      category === 'BUDGET_EXCEEDED' ||
      category === 'TIMEOUT' ||
      category === 'SYSTEM_ERROR'
    );
  }

  private static inferCategory(error: unknown): FailureCategory {
    if (!error) return 'SYSTEM_ERROR';
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const name = (error as any)?.name?.toLowerCase() || '';

    if (msg.includes('injection') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('permission') || msg.includes('security')) {
      return 'SECURITY_ERROR';
    }
    if (msg.includes('budget') || msg.includes('cost limit') || msg.includes('token limit')) {
      return 'BUDGET_EXCEEDED';
    }
    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('deadline')) {
      return 'TIMEOUT';
    }
    if (msg.includes('policy') || msg.includes('disallowed') || msg.includes('violation')) {
      return 'POLICY_ERROR';
    }
    if (msg.includes('schema') || msg.includes('json') || msg.includes('malformed') || msg.includes('model') || msg.includes('slm') || name.includes('model')) {
      return 'MODEL_ERROR';
    }
    if (msg.includes('freshness') || msg.includes('stale') || msg.includes('plan') || msg.includes('planning')) {
      return 'PLANNING_ERROR';
    }
    if (msg.includes('context') || msg.includes('retrieval') || msg.includes('budget context')) {
      return 'CONTEXT_ERROR';
    }
    if (msg.includes('verification') || msg.includes('test failed') || msg.includes('assert')) {
      return 'VERIFICATION_ERROR';
    }
    if (msg.includes('tool') || msg.includes('execut') || msg.includes('file write') || msg.includes('command')) {
      return 'EXECUTION_ERROR';
    }
    if (msg.includes('user') || msg.includes('input') || msg.includes('invalid argument')) {
      return 'USER_ERROR';
    }
    return 'SYSTEM_ERROR';
  }
}
