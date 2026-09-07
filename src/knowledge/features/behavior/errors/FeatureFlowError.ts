import { FeatureBehaviorError } from './FeatureBehaviorError';

export class FeatureFlowError extends FeatureBehaviorError {
  public readonly flowId?: string;

  constructor(message: string, flowId?: string, details?: Record<string, any>) {
    super(message, 'FEATURE_FLOW_ERROR', { ...details, flowId });
    this.name = 'FeatureFlowError';
    this.flowId = flowId;
  }
}
