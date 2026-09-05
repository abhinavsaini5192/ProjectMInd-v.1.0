import { randomUUID } from 'crypto';
import type { IFeatureMappingEngine } from '../interfaces/IFeatureMappingEngine';
import type { MappingContext } from '../interfaces/IFeatureMappingSource';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingResult } from '../models/MappingResult';
import type { MappingRole } from '../models/MappingRole';
import { FeatureMappingCoordinator } from './FeatureMappingCoordinator';
import { FeatureMappingExplainer } from './FeatureMappingExplainer';
import { FeatureMappingValidator } from './FeatureMappingValidator';
import { FeatureMappingRepository } from '../repository/FeatureMappingRepository';
import { FeatureRegistry } from '../../core/FeatureRegistry';
import { FeatureMappingError } from '../errors/FeatureMappingError';
import {
  FEATURE_MAPPING_STARTED,
  FEATURE_MAPPING_CREATED,
  FEATURE_MAPPING_UPDATED,
  FEATURE_MAPPING_DEACTIVATED,
  FEATURE_MAPPING_CONFLICT_DETECTED,
  FEATURE_MAPPING_COMPLETED,
} from '../events/FeatureMappingEvents';

export interface EventPublisher {
  publish(event: string, payload: any): void;
}

export class FeatureMappingEngine implements IFeatureMappingEngine {
  private coordinator: FeatureMappingCoordinator;
  private explainer = new FeatureMappingExplainer();
  private validator = new FeatureMappingValidator();
  private runHistory = new Map<string, MappingResult>();

  constructor(
    private registry: FeatureRegistry = new FeatureRegistry(),
    private repository: FeatureMappingRepository = new FeatureMappingRepository(),
    coordinator?: FeatureMappingCoordinator,
    private eventPublisher?: EventPublisher
  ) {
    this.coordinator = coordinator || new FeatureMappingCoordinator();
  }

  public getRepository(): FeatureMappingRepository {
    return this.repository;
  }

  public getRegistry(): FeatureRegistry {
    return this.registry;
  }

  public async mapFeature(featureId: string, context?: MappingContext): Promise<MappingResult> {
    const startedAt = Date.now();
    const runId = `run_map_${randomUUID().slice(0, 8)}`;

    // 1. Locate feature
    const feature = this.findFeature(featureId);
    if (!feature) {
      throw new FeatureMappingError(`Feature "${featureId}" not found in registry`);
    }

    this.emit(FEATURE_MAPPING_STARTED, {
      runId,
      featureId: feature.id,
      timestamp: startedAt,
    });

    const mappingContext: MappingContext = context || {
      workspaceId: feature.scope?.workspaceId || 'default',
      repositoryId: feature.scope?.repositoryId || 'default',
    };

    // 2. Load existing mappings for feature
    const existingMappings = await this.repository.getMappings(feature.id);

    // 3. Coordinate mapping
    const result = await this.coordinator.coordinateFeatureMapping(feature, mappingContext, existingMappings);
    result.runId = runId;

    // 4. Persist new and updated mappings
    for (const mapping of result.newMappings) {
      await this.repository.save(mapping);
      this.emit(FEATURE_MAPPING_CREATED, {
        mappingId: mapping.mappingId,
        featureId: mapping.featureId,
        resourceId: mapping.resourceId,
        role: mapping.role,
        score: mapping.score,
      });
    }

    for (const mapping of result.updatedMappings) {
      await this.repository.update(mapping);
      this.emit(FEATURE_MAPPING_UPDATED, {
        mappingId: mapping.mappingId,
        featureId: mapping.featureId,
        resourceId: mapping.resourceId,
        role: mapping.role,
        score: mapping.score,
      });
    }

    // 5. Persist conflicts
    for (const conflict of result.conflicts) {
      await this.repository.saveConflict(conflict);
      this.emit(FEATURE_MAPPING_CONFLICT_DETECTED, {
        conflictId: conflict.conflictId,
        featureId: conflict.featureId,
        resourceId: conflict.resourceId,
        severity: conflict.severity,
      });
    }

    // 6. Check for stale mappings: if resource is missing or removed
    const activeResourceIds = new Set(result.mappings.map((m) => m.resourceId));
    for (const existing of existingMappings) {
      if (!activeResourceIds.has(existing.resourceId) && existing.source !== 'MANUAL') {
        await this.repository.deactivate(existing.mappingId, 'RESOURCE_REMOVED');
        result.deactivatedMappings.push(existing);
        result.statistics.mappingsDeactivated++;
        this.emit(FEATURE_MAPPING_DEACTIVATED, {
          mappingId: existing.mappingId,
          featureId: existing.featureId,
          resourceId: existing.resourceId,
          reason: 'RESOURCE_REMOVED',
        });
      }
    }

    this.runHistory.set(runId, result);

    this.emit(FEATURE_MAPPING_COMPLETED, {
      runId,
      featureId: feature.id,
      statistics: result.statistics,
      timestamp: Date.now(),
    });

    return result;
  }

  public async mapFeatures(featureIds: string[], context?: MappingContext): Promise<MappingResult[]> {
    const results: MappingResult[] = [];
    for (const fId of featureIds) {
      const res = await this.mapFeature(fId, context);
      results.push(res);
    }
    return results;
  }

  public async mapIncremental(
    changedResourceIds: string[],
    context?: MappingContext
  ): Promise<MappingResult> {
    const startedAt = Date.now();
    const runId = `run_inc_${randomUUID().slice(0, 8)}`;
    const affectedFeatureIds = new Set<string>();

    // 1. Identify which features map to changed resources
    for (const resId of changedResourceIds) {
      const featIds = await this.repository.getResourceFeatures(resId);
      for (const fId of featIds) {
        affectedFeatureIds.add(fId);
      }
    }

    // Also check context symbols/endpoints for matching feature names if not mapped yet
    if (affectedFeatureIds.size === 0 && context) {
      const allFeatures = this.registry.getAll();
      for (const resId of changedResourceIds) {
        for (const feat of allFeatures) {
          if (resId.toLowerCase().includes(feat.name.toLowerCase())) {
            affectedFeatureIds.add(feat.id);
          }
        }
      }
    }

    const allNewMappings: FeatureResourceMapping[] = [];
    const allUpdatedMappings: FeatureResourceMapping[] = [];
    const allDeactivatedMappings: FeatureResourceMapping[] = [];
    const allConflicts: any[] = [];
    const allMappings: FeatureResourceMapping[] = [];

    // Re-evaluate ONLY affected features
    for (const featId of affectedFeatureIds) {
      const featResult = await this.mapFeature(featId, context);
      allNewMappings.push(...featResult.newMappings);
      allUpdatedMappings.push(...featResult.updatedMappings);
      allDeactivatedMappings.push(...featResult.deactivatedMappings);
      allConflicts.push(...featResult.conflicts);
      allMappings.push(...featResult.mappings);
    }

    const completedAt = Date.now();
    const result: MappingResult = {
      runId,
      startedAt,
      completedAt,
      mappings: allMappings,
      newMappings: allNewMappings,
      updatedMappings: allUpdatedMappings,
      deactivatedMappings: allDeactivatedMappings,
      conflicts: allConflicts,
      statistics: {
        resourcesEvaluated: changedResourceIds.length,
        candidatesGenerated: allMappings.length,
        mappingsCreated: allNewMappings.length,
        mappingsUpdated: allUpdatedMappings.length,
        mappingsDeactivated: allDeactivatedMappings.length,
        conflictsDetected: allConflicts.length,
        sourcesExecuted: affectedFeatureIds.size,
        duration: completedAt - startedAt,
      },
    };

    this.runHistory.set(runId, result);
    return result;
  }

  public async getMappings(featureId: string): Promise<FeatureResourceMapping[]> {
    return this.repository.getMappings(featureId);
  }

  public async getMappingsByRole(featureId: string, role: MappingRole): Promise<FeatureResourceMapping[]> {
    return this.repository.getMappingsByRole(featureId, role);
  }

  public async getResourceFeatures(resourceId: string): Promise<string[]> {
    return this.repository.getResourceFeatures(resourceId);
  }

  public async getMapping(mappingId: string): Promise<FeatureResourceMapping | null> {
    return this.repository.get(mappingId);
  }

  public async explainMapping(mappingId: string): Promise<Record<string, any>> {
    const mapping = await this.repository.get(mappingId);
    if (!mapping) {
      throw new FeatureMappingError(`Mapping "${mappingId}" not found`);
    }

    const conflicts = await this.repository.queryConflicts(mapping.featureId);
    return this.explainer.explain(mapping, conflicts);
  }

  public async validateMapping(mappingId: string): Promise<{ valid: boolean; issues: string[] }> {
    const mapping = await this.repository.get(mappingId);
    if (!mapping) {
      throw new FeatureMappingError(`Mapping "${mappingId}" not found`);
    }

    const issues: string[] = [];
    if (!mapping.active) {
      issues.push(`Mapping is inactive: ${mapping.deactivationReason || 'DEACTIVATED'}`);
    }
    if (mapping.score < 0.20) {
      issues.push(`Score (${mapping.score}) is below minimum threshold`);
    }

    return { valid: issues.length === 0, issues };
  }

  public async deactivateMapping(mappingId: string, reason: string = 'RESOURCE_REMOVED'): Promise<void> {
    const mapping = await this.repository.get(mappingId);
    if (!mapping) {
      throw new FeatureMappingError(`Mapping "${mappingId}" not found`);
    }

    await this.repository.deactivate(mappingId, reason);
    this.emit(FEATURE_MAPPING_DEACTIVATED, {
      mappingId,
      featureId: mapping.featureId,
      resourceId: mapping.resourceId,
      reason,
    });
  }

  public getMappingRun(runId: string): MappingResult | undefined {
    return this.runHistory.get(runId);
  }

  private findFeature(featureIdOrName: string): any | undefined {
    const byId = this.registry.getSync(featureIdOrName as any);
    if (byId) return byId;

    const byName = this.registry.getByName(featureIdOrName);
    if (byName) return byName;

    const all = this.registry.getAll();
    return all.find((f) => f.id === featureIdOrName || f.name.toLowerCase() === featureIdOrName.toLowerCase());
  }

  private emit(event: string, payload: any): void {
    if (this.eventPublisher) {
      try {
        this.eventPublisher.publish(event, payload);
      } catch (err) {
        // Suppress event publication errors
      }
    }
  }
}
