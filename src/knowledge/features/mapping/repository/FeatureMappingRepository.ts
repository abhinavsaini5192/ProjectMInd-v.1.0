import type { IFeatureMappingRepository } from '../interfaces/IFeatureMappingRepository';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingRole } from '../models/MappingRole';
import type { MappingConflict } from '../models/MappingConflict';
import { FeatureMappingError } from '../errors/FeatureMappingError';

export class FeatureMappingRepository implements IFeatureMappingRepository {
  private mappings = new Map<string, FeatureResourceMapping>();
  private featureIndex = new Map<string, Set<string>>();
  private resourceIndex = new Map<string, Set<string>>();
  private conflicts = new Map<string, MappingConflict>();

  public async save(mapping: FeatureResourceMapping): Promise<void> {
    this.mappings.set(mapping.mappingId, mapping);

    // Update feature index
    if (!this.featureIndex.has(mapping.featureId)) {
      this.featureIndex.set(mapping.featureId, new Set());
    }
    this.featureIndex.get(mapping.featureId)!.add(mapping.mappingId);

    // Update resource index (supports multi-feature reverse lookup)
    if (!this.resourceIndex.has(mapping.resourceId)) {
      this.resourceIndex.set(mapping.resourceId, new Set());
    }
    this.resourceIndex.get(mapping.resourceId)!.add(mapping.mappingId);
  }

  public async update(mapping: FeatureResourceMapping): Promise<void> {
    if (!this.mappings.has(mapping.mappingId)) {
      throw new FeatureMappingError(`Mapping "${mapping.mappingId}" not found for update`);
    }
    await this.save(mapping);
  }

  public async get(mappingId: string): Promise<FeatureResourceMapping | null> {
    return this.mappings.get(mappingId) || null;
  }

  public async getMappings(featureId: string): Promise<FeatureResourceMapping[]> {
    const ids = this.featureIndex.get(featureId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.mappings.get(id))
      .filter((m): m is FeatureResourceMapping => Boolean(m && m.active));
  }

  public async getMappingsByRole(featureId: string, role: MappingRole): Promise<FeatureResourceMapping[]> {
    const all = await this.getMappings(featureId);
    return all.filter((m) => m.role === role);
  }

  public async getResourceFeatures(resourceId: string): Promise<string[]> {
    const mappingIds = this.resourceIndex.get(resourceId);
    if (!mappingIds) return [];

    const featureIds = new Set<string>();
    for (const mId of mappingIds) {
      const mapping = this.mappings.get(mId);
      if (mapping && mapping.active) {
        featureIds.add(mapping.featureId);
      }
    }

    return Array.from(featureIds);
  }

  public async deactivate(mappingId: string, reason: string = 'RESOURCE_REMOVED'): Promise<void> {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) {
      throw new FeatureMappingError(`Mapping "${mappingId}" not found to deactivate`);
    }

    mapping.active = false;
    mapping.deactivationReason = reason;
    mapping.updatedAt = Date.now();
  }

  public async queryConflicts(featureId?: string): Promise<MappingConflict[]> {
    const allConflicts = Array.from(this.conflicts.values());
    if (featureId) {
      return allConflicts.filter((c) => c.featureId === featureId);
    }
    return allConflicts;
  }

  public async saveConflict(conflict: MappingConflict): Promise<void> {
    this.conflicts.set(conflict.conflictId, conflict);
  }

  public async getAll(): Promise<FeatureResourceMapping[]> {
    return Array.from(this.mappings.values());
  }
}
