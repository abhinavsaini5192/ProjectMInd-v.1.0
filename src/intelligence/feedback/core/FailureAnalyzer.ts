import { ExecutionObservation } from '../models/ExecutionObservation';
import { ActionPlan } from '../../planning/models/ActionPlan';
import { FailureAnalysis, FailureType } from '../models/FailureAnalysis';

export class FailureAnalyzer {
  public analyzeFailure(plan: ActionPlan, obs: ExecutionObservation): FailureAnalysis {
    let failureType: FailureType = 'UNKNOWN';
    let directCause = 'Unknown execution failure';
    let retryable = false;
    let recommendation: FailureAnalysis['recommendation'] = 'REPLAN';

    const errStr = [...obs.errors, ...obs.testResults.failures, ...obs.buildResults.errors].join(' ').toLowerCase();

    if (obs.testResults.testsFailed > 0 || errStr.includes('test failed') || errStr.includes('assertion') || errStr.includes('test timeout')) {
      failureType = 'TEST_FAILURE';
      directCause = `Test assertions failed: ${obs.testResults.failures.slice(0, 2).join('; ') || 'Test assertions failed'}`;
      retryable = false;
      recommendation = 'REPLAN';
    } else if (obs.buildResults.errors.length > 0 || errStr.includes('syntax') || errStr.includes('typeerror') || errStr.includes('compiler error')) {
      failureType = 'BUILD_FAILURE';
      directCause = `Compiler or type errors detected: ${obs.buildResults.errors.slice(0, 2).join('; ') || 'Compiler error'}`;
      retryable = false;
      recommendation = 'REPLAN';
    } else if (errStr.includes('permission') || errStr.includes('denied') || errStr.includes('eacces')) {
      failureType = 'PERMISSION_FAILURE';
      directCause = 'File or tool permission denied in execution sandbox';
      retryable = false;
      recommendation = 'ASK_USER';
    } else if (errStr.includes('precondition')) {
      failureType = 'PRECONDITION_FAILURE';
      directCause = 'Precondition violated during execution';
      retryable = false;
      recommendation = 'GATHER_CONTEXT';
    } else if (errStr.includes('econnrefused') || errStr.includes('connection timeout') || errStr.includes('network')) {
      failureType = 'ENVIRONMENT_FAILURE';
      directCause = 'Transient network or environment timeout';
      retryable = true;
      recommendation = 'RETRY';
    }

    return {
      failureType,
      directCause,
      contributingFactors: obs.warnings,
      affectedResources: plan.affectedResources,
      failedAssumptions: [],
      retryable,
      recommendation
    };
  }
}
