import { FeatureId } from '../models/FeatureId';
import { FeatureVersion, FeatureChangeType } from '../models/FeatureVersion';

export class FeatureVersionManager {
  private history = new Map<FeatureId, FeatureVersion[]>();

  public recordChange(
    featureId: FeatureId,
    changeType: FeatureChangeType,
    reason?: string,
    snapshot?: any,
    previousName?: string
  ): FeatureVersion {
    const versions = this.history.get(featureId) || [];
    const nextVersion = versions.length + 1;

    const versionRecord: FeatureVersion = {
      version: nextVersion,
      featureId,
      changedAt: Date.now(),
      changeType,
      reason,
      previousName,
      snapshot
    };

    versions.push(versionRecord);
    this.history.set(featureId, versions);
    return versionRecord;
  }

  public getHistory(featureId: FeatureId): FeatureVersion[] {
    return [...(this.history.get(featureId) || [])];
  }

  public getLatestVersion(featureId: FeatureId): number {
    const versions = this.history.get(featureId) || [];
    return versions.length > 0 ? versions[versions.length - 1].version : 1;
  }
}
