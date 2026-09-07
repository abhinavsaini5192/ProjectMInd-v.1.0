import type { FeatureId } from '../../models/FeatureId';
import type { IFeatureBehaviorRepository } from '../interfaces/IFeatureBehaviorRepository';
import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureBehaviorConflict } from '../models/FeatureBehaviorConflict';
import type { FeatureFlow } from '../models/FeatureFlow';

export class FeatureBehaviorRepository implements IFeatureBehaviorRepository {
  private behaviorsByFeatureId = new Map<FeatureId, FeatureBehavior>();
  private flowsById = new Map<string, FeatureFlow>();
  private conflictsById = new Map<string, FeatureBehaviorConflict>();

  public async saveBehavior(behavior: FeatureBehavior): Promise<void> {
    this.behaviorsByFeatureId.set(behavior.featureId, { ...behavior });
    for (const flow of behavior.flows) {
      this.flowsById.set(flow.flowId, { ...flow });
    }
  }

  public async getBehavior(featureId: FeatureId): Promise<FeatureBehavior | null> {
    const beh = this.behaviorsByFeatureId.get(featureId);
    return beh ? { ...beh } : null;
  }

  public async getAllBehaviors(): Promise<FeatureBehavior[]> {
    return Array.from(this.behaviorsByFeatureId.values()).map(b => ({ ...b }));
  }

  public async getFlow(flowId: string): Promise<FeatureFlow | null> {
    const flow = this.flowsById.get(flowId);
    return flow ? { ...flow } : null;
  }

  public async saveConflict(conflict: FeatureBehaviorConflict): Promise<void> {
    this.conflictsById.set(conflict.conflictId, { ...conflict });
  }

  public async getConflicts(featureId?: FeatureId): Promise<FeatureBehaviorConflict[]> {
    const all = Array.from(this.conflictsById.values());
    if (featureId) {
      return all.filter(c => c.featureId === featureId).map(c => ({ ...c }));
    }
    return all.map(c => ({ ...c }));
  }

  public async resolveConflict(conflictId: string, resolution: string): Promise<void> {
    const conflict = this.conflictsById.get(conflictId);
    if (conflict) {
      conflict.status = 'RESOLVED';
      conflict.resolution = resolution;
      conflict.resolvedAt = Date.now();
    }
  }

  public async deleteBehavior(featureId: FeatureId): Promise<boolean> {
    const existing = this.behaviorsByFeatureId.get(featureId);
    if (existing) {
      for (const flow of existing.flows) {
        this.flowsById.delete(flow.flowId);
      }
      this.behaviorsByFeatureId.delete(featureId);
      return true;
    }
    return false;
  }

  public async clear(): Promise<void> {
    this.behaviorsByFeatureId.clear();
    this.flowsById.clear();
    this.conflictsById.clear();
  }
}
