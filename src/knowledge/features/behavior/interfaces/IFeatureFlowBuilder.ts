import type { FeatureFlow } from '../models/FeatureFlow';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { BehaviorContext } from './IFeatureBehaviorSource';

export interface IFeatureFlowBuilder {
  buildFlows(candidates: FeatureBehaviorCandidate[], context: BehaviorContext): Promise<FeatureFlow[]>;
}
