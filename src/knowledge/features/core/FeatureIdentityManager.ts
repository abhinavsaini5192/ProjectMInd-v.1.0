import { IFeatureIdentityManager } from '../interfaces/IFeatureIdentityManager';
import { FeatureId, isValidFeatureId } from '../models/FeatureId';
import { InvalidFeatureError } from '../errors/InvalidFeatureError';

export class FeatureIdentityManager implements IFeatureIdentityManager {
  public createFeatureId(name: string, repositoryId: string): FeatureId {
    const raw = `${repositoryId}_${name}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const sanitized = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `feat_${sanitized.slice(0, 32)}`;
  }

  public validateFeatureId(id: string): void {
    if (!this.isValidFeatureId(id)) {
      throw new InvalidFeatureError(`Invalid Feature ID format: "${id}"`, ['FeatureId must start with feat_ followed by alphanumeric characters']);
    }
  }

  public isValidFeatureId(id: string): boolean {
    return isValidFeatureId(id);
  }

  public ensureUniqueFeatureId(id: FeatureId, existingIds: Set<FeatureId>): FeatureId {
    if (!existingIds.has(id)) return id;
    let suffix = 1;
    while (existingIds.has(`${id}_${suffix}`)) {
      suffix++;
    }
    return `${id}_${suffix}`;
  }
}
