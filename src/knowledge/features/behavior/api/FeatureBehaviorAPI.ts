import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehaviorEngine } from '../core/FeatureBehaviorEngine';
import type { BehaviorContext } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureBehaviorConflict } from '../models/FeatureBehaviorConflict';
import type { FeatureBehaviorResult } from '../models/FeatureBehaviorResult';
import type { FeatureFlow } from '../models/FeatureFlow';
import type { IFeatureBehaviorRepository } from '../interfaces/IFeatureBehaviorRepository';

export class FeatureBehaviorAPI {
  constructor(
    private engine: FeatureBehaviorEngine,
    private repository: IFeatureBehaviorRepository
  ) {}

  public async getBehavior(featureId: FeatureId): Promise<FeatureBehavior | null> {
    return this.engine.getBehavior(featureId);
  }

  public async getAllBehaviors(): Promise<FeatureBehavior[]> {
    return this.repository.getAllBehaviors();
  }

  public async getFlow(flowId: string): Promise<FeatureFlow | null> {
    return this.repository.getFlow(flowId);
  }

  public async explainBehavior(featureId: FeatureId): Promise<string> {
    const beh = await this.getBehavior(featureId);
    if (!beh) {
      return `No behavior discovered for feature ${featureId}`;
    }
    return this.engine.explainBehavior(beh, featureId);
  }

  public async explainFlow(flowId: string): Promise<string> {
    return this.engine.explainFlow(flowId);
  }

  public async getConflicts(featureId?: FeatureId): Promise<FeatureBehaviorConflict[]> {
    return this.repository.getConflicts(featureId);
  }

  public async analyzeFeature(
    featureId: FeatureId,
    context: BehaviorContext
  ): Promise<FeatureBehaviorResult> {
    return this.engine.analyzeFeatureBehavior(featureId, context);
  }

  public async analyzeBatch(
    featureIds: FeatureId[],
    context: BehaviorContext
  ): Promise<FeatureBehaviorResult> {
    return this.engine.analyzeBatch(featureIds, context);
  }

  public async analyzeIncremental(
    changedResourceIds: string[],
    context: BehaviorContext
  ): Promise<FeatureBehaviorResult> {
    return this.engine.analyzeIncremental(changedResourceIds, context);
  }
}
