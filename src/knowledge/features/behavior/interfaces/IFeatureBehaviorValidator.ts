import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureFlow } from '../models/FeatureFlow';
import type { BehaviorContext } from './IFeatureBehaviorSource';

export interface BehaviorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IFeatureBehaviorValidator {
  validateFlow(flow: FeatureFlow, context: BehaviorContext): Promise<BehaviorValidationResult>;
  validateBehavior(behavior: FeatureBehavior, context: BehaviorContext): Promise<BehaviorValidationResult>;
}
