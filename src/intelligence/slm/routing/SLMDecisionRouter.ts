import { SLMTaskType } from '../models/SLMTaskType';
import { TrustEstimator } from './TrustEstimator';

export enum RoutingDecision {
  DETERMINISTIC_ONLY = 'DETERMINISTIC_ONLY',
  HYBRID = 'HYBRID',
  SLM_PRIMARY = 'SLM_PRIMARY'
}

export class SLMDecisionRouter {
  constructor(
    private trustEstimator: TrustEstimator,
    private trustThreshold: number = 0.7
  ) {}

  public routeTask(taskType: SLMTaskType, isSecurityCritical: boolean = false): RoutingDecision {
    if (isSecurityCritical) {
      // Security decisions NEVER touch the SLM unless explicitly bypassed globally.
      return RoutingDecision.DETERMINISTIC_ONLY;
    }

    const trustScore = this.trustEstimator.getTrustScore(taskType);

    if (trustScore >= this.trustThreshold) {
       return RoutingDecision.SLM_PRIMARY;
    }

    if (trustScore >= (this.trustThreshold * 0.6)) {
       return RoutingDecision.HYBRID;
    }

    return RoutingDecision.DETERMINISTIC_ONLY;
  }
}
