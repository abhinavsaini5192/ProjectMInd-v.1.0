import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureBehaviorConflict } from '../models/FeatureBehaviorConflict';
import type { FeatureFlow } from '../models/FeatureFlow';

export interface IFeatureBehaviorRepository {
  saveBehavior(behavior: FeatureBehavior): Promise<void>;
  getBehavior(featureId: FeatureId): Promise<FeatureBehavior | null>;
  getAllBehaviors(): Promise<FeatureBehavior[]>;
  getFlow(flowId: string): Promise<FeatureFlow | null>;
  saveConflict(conflict: FeatureBehaviorConflict): Promise<void>;
  getConflicts(featureId?: FeatureId): Promise<FeatureBehaviorConflict[]>;
  resolveConflict(conflictId: string, resolution: string): Promise<void>;
  deleteBehavior(featureId: FeatureId): Promise<boolean>;
  clear(): Promise<void>;
}
