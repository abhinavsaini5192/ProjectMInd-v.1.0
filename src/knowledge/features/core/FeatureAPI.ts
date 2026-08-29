import { Feature, createDefaultFeature } from '../models/Feature';
import { FeatureId } from '../models/FeatureId';
import { FeatureScope } from '../models/FeatureScope';
import { FeatureReference } from '../models/FeatureReference';
import { FeatureRelationship } from '../models/FeatureRelationship';
import { FeatureVersion } from '../models/FeatureVersion';
import { FeatureIdentityManager } from './FeatureIdentityManager';
import { FeatureValidator } from './FeatureValidator';
import { FeatureVersionManager } from './FeatureVersionManager';
import { FeatureRegistry } from './FeatureRegistry';
import { FeatureNotFoundError } from '../errors/FeatureNotFoundError';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class FeatureAPI {
  private identityManager = new FeatureIdentityManager();
  private validator = new FeatureValidator();
  private versionManager = new FeatureVersionManager();

  constructor(
    private registry: FeatureRegistry,
    private dispatcher?: KernelEventDispatcher
  ) {}

  public async createFeature(
    name: string,
    scope: FeatureScope,
    options: Partial<Feature> = {}
  ): Promise<Feature> {
    const featureId = options.id || this.identityManager.createFeatureId(name, scope.repositoryId);
    const feature = createDefaultFeature(featureId, name, scope, options);

    this.validator.validate(feature);
    await this.registry.register(feature);

    this.versionManager.recordChange(feature.id, 'CREATED', 'Initial feature creation', feature);

    if (this.dispatcher) {
      this.dispatcher.publish('FEATURE_CREATED', { featureId: feature.id, repositoryId: scope.repositoryId, version: 1 });
    }

    return feature;
  }

  public async getFeature(id: FeatureId): Promise<Feature> {
    const feature = await this.registry.get(id);
    if (!feature) throw new FeatureNotFoundError(id);
    return feature;
  }

  public async updateFeature(feature: Feature, reason?: string): Promise<Feature> {
    this.validator.validate(feature);
    feature.updatedAt = Date.now();
    await this.registry.update(feature);

    this.versionManager.recordChange(feature.id, 'UPDATED', reason || 'Feature updated', feature);

    if (this.dispatcher) {
      this.dispatcher.publish('FEATURE_UPDATED', { featureId: feature.id, repositoryId: feature.scope.repositoryId, version: feature.version });
    }

    return feature;
  }

  public async renameFeature(id: FeatureId, newName: string): Promise<Feature> {
    const feature = await this.getFeature(id);
    const oldName = feature.name;
    feature.name = newName;
    feature.updatedAt = Date.now();
    feature.version = this.versionManager.getLatestVersion(id) + 1;

    this.validator.validate(feature);
    await this.registry.update(feature);

    this.versionManager.recordChange(feature.id, 'RENAMED', `Renamed from ${oldName} to ${newName}`, feature, oldName);

    if (this.dispatcher) {
      this.dispatcher.publish('FEATURE_UPDATED', { featureId: feature.id, changeType: 'RENAMED', oldName, newName });
    }

    return feature;
  }

  public async deleteFeature(id: FeatureId): Promise<boolean> {
    const feature = await this.registry.get(id);
    if (!feature) return false;

    const removed = await this.registry.remove(id);
    if (removed && this.dispatcher) {
      this.dispatcher.publish('FEATURE_DELETED', { featureId: id, repositoryId: feature.scope.repositoryId });
    }
    return removed;
  }

  public async listFeatures(repositoryId?: string): Promise<Feature[]> {
    return this.registry.list(repositoryId);
  }

  public async findFeatures(query: { name?: string; referenceId?: string; repositoryId?: string }): Promise<Feature[]> {
    if (query.name) return this.registry.findByName(query.name, query.repositoryId);
    if (query.referenceId) return this.registry.findByReference(query.referenceId);
    if (query.repositoryId) return this.registry.findByRepository(query.repositoryId);
    return this.registry.list();
  }

  public getFeatureHistory(id: FeatureId): FeatureVersion[] {
    return this.versionManager.getHistory(id);
  }

  public async addReference(id: FeatureId, reference: FeatureReference): Promise<Feature> {
    const feature = await this.getFeature(id);
    feature.references.push(reference);
    return this.updateFeature(feature, `Added reference: ${reference.resourceId}`);
  }

  public async removeReference(id: FeatureId, referenceId: string): Promise<Feature> {
    const feature = await this.getFeature(id);
    feature.references = feature.references.filter(r => r.referenceId !== referenceId);
    return this.updateFeature(feature, `Removed reference: ${referenceId}`);
  }

  public async addRelationship(id: FeatureId, relationship: FeatureRelationship): Promise<Feature> {
    const feature = await this.getFeature(id);
    feature.relationships.push(relationship);
    return this.updateFeature(feature, `Added relationship to ${relationship.targetFeatureId}`);
  }

  public async removeRelationship(id: FeatureId, targetFeatureId: FeatureId): Promise<Feature> {
    const feature = await this.getFeature(id);
    feature.relationships = feature.relationships.filter(r => r.targetFeatureId !== targetFeatureId);
    return this.updateFeature(feature, `Removed relationship to ${targetFeatureId}`);
  }
}
