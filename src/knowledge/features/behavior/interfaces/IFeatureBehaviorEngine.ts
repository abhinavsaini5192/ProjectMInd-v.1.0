import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureBehaviorResult } from '../models/FeatureBehaviorResult';
import type { BehaviorContext } from './IFeatureBehaviorSource';

export interface IFeatureBehaviorEngine {
  analyzeFeatureBehavior(featureId: FeatureId, context: BehaviorContext): Promise<FeatureBehaviorResult>;
  analyzeBatch(featureIds: FeatureId[], context: BehaviorContext): Promise<FeatureBehaviorResult>;
  analyzeIncremental(changedResourceIds: string[], context: BehaviorContext): Promise<FeatureBehaviorResult>;
  getBehavior(featureId: FeatureId): Promise<FeatureBehavior | null>;
  explainFlow(flowId: string): Promise<string>;
}
