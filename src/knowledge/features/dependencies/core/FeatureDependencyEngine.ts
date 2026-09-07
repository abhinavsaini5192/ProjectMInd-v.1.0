import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyPath } from '../models/FeatureDependencyPath';
import type { FeatureDependencyCycle } from '../models/FeatureDependencyCycle';
import type { FeatureDependencyResult, FeatureDependencyStatistics } from '../models/FeatureDependencyResult';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { IFeatureDependencyEngine } from '../interfaces/IFeatureDependencyEngine';
import type { IFeatureRelationshipSource, DependencyContext } from '../interfaces/IFeatureRelationshipSource';
import type { IFeatureRelationshipScorer } from '../interfaces/IFeatureRelationshipScorer';
import type { IFeatureRelationshipValidator } from '../interfaces/IFeatureRelationshipValidator';
import type { IFeatureRelationshipResolver } from '../interfaces/IFeatureRelationshipResolver';
import type { IFeatureDependencyGraph } from '../interfaces/IFeatureDependencyGraph';
import type { IFeatureRelationshipRepository } from '../interfaces/IFeatureRelationshipRepository';

import { FeatureRegistry } from '../../core/FeatureRegistry';
import { FeatureDependencyGraph } from './FeatureDependencyGraph';
import { FeatureRelationshipRepository } from '../repository/FeatureRelationshipRepository';
import { FeatureRelationshipScorer } from './FeatureRelationshipScorer';
import { FeatureRelationshipValidator } from './FeatureRelationshipValidator';
import { FeatureRelationshipResolver } from './FeatureRelationshipResolver';
import { FeatureDependencyExplainer } from './FeatureDependencyExplainer';
import { FeatureDependencyError } from '../errors/FeatureDependencyError';

import { CodeDependencySource } from '../sources/CodeDependencySource';
import { SharedResourceSource } from '../sources/SharedResourceSource';
import { EndpointInteractionSource } from '../sources/EndpointInteractionSource';
import { DataDependencySource } from '../sources/DataDependencySource';
import { ConfigurationDependencySource } from '../sources/ConfigurationDependencySource';
import { ModuleDependencySource } from '../sources/ModuleDependencySource';
import { IntegrationDependencySource } from '../sources/IntegrationDependencySource';
import { ArchitectureDependencySource } from '../sources/ArchitectureDependencySource';
import { TestRelationshipSource } from '../sources/TestRelationshipSource';
import { HistoryRelationshipSource } from '../sources/HistoryRelationshipSource';

import {
  FEATURE_DEPENDENCY_STARTED,
  FEATURE_RELATIONSHIP_CREATED,
  FEATURE_RELATIONSHIP_UPDATED,
  FEATURE_RELATIONSHIP_DEACTIVATED,
  FEATURE_DEPENDENCY_CONFLICT_DETECTED,
  FEATURE_DEPENDENCY_CYCLE_DETECTED,
  FEATURE_DEPENDENCY_COMPLETED,
} from '../events/FeatureDependencyEvents';

export interface EventPublisher {
  publish(event: string, payload: any): void;
}

export class FeatureDependencyEngine implements IFeatureDependencyEngine {
  private sources: IFeatureRelationshipSource[];
  private scorer: IFeatureRelationshipScorer;
  private validator: IFeatureRelationshipValidator;
  private resolver: IFeatureRelationshipResolver;
  private graph: IFeatureDependencyGraph;
  private repository: IFeatureRelationshipRepository;
  private explainer: FeatureDependencyExplainer;
  private runHistory = new Map<string, FeatureDependencyResult>();

  constructor(
    private registry: FeatureRegistry = new FeatureRegistry(),
    repository?: IFeatureRelationshipRepository,
    graph?: IFeatureDependencyGraph,
    sources?: IFeatureRelationshipSource[],
    scorer?: IFeatureRelationshipScorer,
    validator?: IFeatureRelationshipValidator,
    resolver?: IFeatureRelationshipResolver,
    explainer?: FeatureDependencyExplainer,
    private eventPublisher?: EventPublisher
  ) {
    this.repository = repository || new FeatureRelationshipRepository();
    this.graph = graph || new FeatureDependencyGraph();
    this.sources = sources || [
      new CodeDependencySource(),
      new SharedResourceSource(),
      new EndpointInteractionSource(),
      new DataDependencySource(),
      new ConfigurationDependencySource(),
      new ModuleDependencySource(),
      new IntegrationDependencySource(),
      new ArchitectureDependencySource(),
      new TestRelationshipSource(),
      new HistoryRelationshipSource(),
    ];
    this.scorer = scorer || new FeatureRelationshipScorer();
    this.validator = validator || new FeatureRelationshipValidator();
    this.resolver = resolver || new FeatureRelationshipResolver();
    this.explainer = explainer || new FeatureDependencyExplainer();
  }

  public getGraph(): IFeatureDependencyGraph {
    return this.graph;
  }

  public getRepository(): IFeatureRelationshipRepository {
    return this.repository;
  }

  public getRegistry(): FeatureRegistry {
    return this.registry;
  }

  public async discoverRelationships(featureId: string, context?: DependencyContext): Promise<FeatureDependencyResult> {
    const startedAt = Date.now();
    const runId = `run_dep_${randomUUID().slice(0, 8)}`;

    const feature = this.findFeature(featureId);
    if (!feature) {
      throw new FeatureDependencyError(`Feature "${featureId}" not found in registry`);
    }

    this.emit(FEATURE_DEPENDENCY_STARTED, { runId, featureId: feature.id, timestamp: startedAt });

    const allFeatures = this.registry.getAll();
    for (const f of allFeatures) {
      this.graph.addFeature(f);
    }

    const featureMap = new Map<string, Feature>(allFeatures.map((f) => [f.id, f]));
    const effectiveContext: DependencyContext = context || {
      workspaceId: feature.scope?.workspaceId || 'default',
      repositoryId: feature.scope?.repositoryId || 'default',
    };

    // 1. Collect candidates across sources
    const rawCandidates: FeatureRelationshipCandidate[] = [];
    for (const source of this.sources) {
      try {
        const candidates = await source.discoverRelationships(feature, allFeatures, effectiveContext);
        rawCandidates.push(...candidates);
      } catch (err) {
        // Individual source errors must not crash the entire discovery pipeline
      }
    }

    // 2. Score & validate candidates
    const validCandidates: FeatureRelationshipCandidate[] = [];
    for (const candidate of rawCandidates) {
      this.scorer.scoreCandidate(candidate);
      const val = this.validator.validateCandidate(candidate, featureMap, effectiveContext.repositoryId);
      if (val.valid) {
        validCandidates.push(candidate);
      }
    }

    // 3. Load existing relationships
    const existing = await this.repository.getRelationships(feature.id);

    // 4. Resolve candidates
    const { resolvedRelationships, conflicts } = this.resolver.resolve(validCandidates, existing);

    // 5. Categorize and persist
    const newRelationships: FeatureRelationship[] = [];
    const updatedRelationships: FeatureRelationship[] = [];
    const deactivatedRelationships: FeatureRelationship[] = [];

    const existingById = new Map<string, FeatureRelationship>(existing.map((r) => [r.relationshipId, r]));

    for (const rel of resolvedRelationships) {
      if (existingById.has(rel.relationshipId)) {
        await this.repository.update(rel);
        this.graph.addRelationship(rel);
        updatedRelationships.push(rel);
        this.emit(FEATURE_RELATIONSHIP_UPDATED, { relationshipId: rel.relationshipId });
      } else {
        await this.repository.save(rel);
        this.graph.addRelationship(rel);
        newRelationships.push(rel);
        this.emit(FEATURE_RELATIONSHIP_CREATED, { relationshipId: rel.relationshipId });
      }
    }

    // 6. Stale relationship deactivation
    const activeResolvedIds = new Set(resolvedRelationships.map((r) => r.relationshipId));
    for (const oldRel of existing) {
      if (!activeResolvedIds.has(oldRel.relationshipId) && oldRel.source !== 'MANUAL') {
        await this.repository.deactivate(oldRel.relationshipId, 'RELATIONSHIP_REMOVED');
        this.graph.removeRelationship(oldRel.relationshipId);
        deactivatedRelationships.push(oldRel);
        this.emit(FEATURE_RELATIONSHIP_DEACTIVATED, { relationshipId: oldRel.relationshipId });
      }
    }

    // 7. Persist conflicts
    for (const conflict of conflicts) {
      await this.repository.saveConflict(conflict);
      this.emit(FEATURE_DEPENDENCY_CONFLICT_DETECTED, { conflictId: conflict.conflictId });
    }

    // 8. Detect cycles
    const cycles = this.graph.detectCycles();
    for (const cycle of cycles) {
      this.emit(FEATURE_DEPENDENCY_CYCLE_DETECTED, { cycleId: cycle.cycleId, classification: cycle.classification });
    }

    const completedAt = Date.now();
    const stats: FeatureDependencyStatistics = {
      featuresEvaluated: 1,
      candidateRelationships: rawCandidates.length,
      relationshipsCreated: newRelationships.length,
      relationshipsUpdated: updatedRelationships.length,
      relationshipsDeactivated: deactivatedRelationships.length,
      conflictsDetected: conflicts.length,
      cyclesDetected: cycles.length,
      sourcesExecuted: this.sources.length,
      duration: completedAt - startedAt,
      slmCalls: 0,
      tokensUsed: 0,
    };

    const result: FeatureDependencyResult = {
      runId,
      startedAt,
      completedAt,
      relationships: resolvedRelationships,
      newRelationships,
      updatedRelationships,
      deactivatedRelationships,
      conflicts,
      cycles,
      statistics: stats,
    };

    this.runHistory.set(runId, result);
    this.emit(FEATURE_DEPENDENCY_COMPLETED, { runId, statistics: stats });

    return result;
  }

  public async discoverRelationshipsForFeatures(
    featureIds: string[],
    context?: DependencyContext
  ): Promise<FeatureDependencyResult[]> {
    const results: FeatureDependencyResult[] = [];
    for (const id of featureIds) {
      const res = await this.discoverRelationships(id, context);
      results.push(res);
    }
    return results;
  }

  public async buildCompleteGraph(context?: DependencyContext): Promise<FeatureDependencyResult> {
    const startedAt = Date.now();
    const runId = `run_dep_all_${randomUUID().slice(0, 8)}`;

    const allFeatures = this.registry.getAll();
    for (const f of allFeatures) {
      this.graph.addFeature(f);
    }

    const featureMap = new Map<string, Feature>(allFeatures.map((f) => [f.id, f]));
    const effectiveContext: DependencyContext = context || {
      workspaceId: 'default',
      repositoryId: 'default',
    };

    const rawCandidates: FeatureRelationshipCandidate[] = [];
    for (const feature of allFeatures) {
      for (const source of this.sources) {
        try {
          const candidates = await source.discoverRelationships(feature, allFeatures, effectiveContext);
          rawCandidates.push(...candidates);
        } catch {
          // Continue
        }
      }
    }

    // Score & validate
    const validCandidates: FeatureRelationshipCandidate[] = [];
    for (const candidate of rawCandidates) {
      this.scorer.scoreCandidate(candidate);
      const val = this.validator.validateCandidate(candidate, featureMap, effectiveContext.repositoryId);
      if (val.valid) {
        validCandidates.push(candidate);
      }
    }

    // Existing relationships
    const existing = await this.repository.getAll();
    const { resolvedRelationships, conflicts } = this.resolver.resolve(validCandidates, existing);

    const newRelationships: FeatureRelationship[] = [];
    const updatedRelationships: FeatureRelationship[] = [];
    const deactivatedRelationships: FeatureRelationship[] = [];
    const existingById = new Map<string, FeatureRelationship>(existing.map((r) => [r.relationshipId, r]));

    for (const rel of resolvedRelationships) {
      if (existingById.has(rel.relationshipId)) {
        await this.repository.update(rel);
        this.graph.addRelationship(rel);
        updatedRelationships.push(rel);
      } else {
        await this.repository.save(rel);
        this.graph.addRelationship(rel);
        newRelationships.push(rel);
      }
    }

    const activeResolvedIds = new Set(resolvedRelationships.map((r) => r.relationshipId));
    for (const oldRel of existing) {
      if (!activeResolvedIds.has(oldRel.relationshipId) && oldRel.source !== 'MANUAL') {
        await this.repository.deactivate(oldRel.relationshipId, 'RELATIONSHIP_REMOVED');
        this.graph.removeRelationship(oldRel.relationshipId);
        deactivatedRelationships.push(oldRel);
      }
    }

    for (const conflict of conflicts) {
      await this.repository.saveConflict(conflict);
    }

    const cycles = this.graph.detectCycles();
    const completedAt = Date.now();

    const stats: FeatureDependencyStatistics = {
      featuresEvaluated: allFeatures.length,
      candidateRelationships: rawCandidates.length,
      relationshipsCreated: newRelationships.length,
      relationshipsUpdated: updatedRelationships.length,
      relationshipsDeactivated: deactivatedRelationships.length,
      conflictsDetected: conflicts.length,
      cyclesDetected: cycles.length,
      sourcesExecuted: this.sources.length * allFeatures.length,
      duration: completedAt - startedAt,
      slmCalls: 0,
      tokensUsed: 0,
    };

    const result: FeatureDependencyResult = {
      runId,
      startedAt,
      completedAt,
      relationships: resolvedRelationships,
      newRelationships,
      updatedRelationships,
      deactivatedRelationships,
      conflicts,
      cycles,
      statistics: stats,
    };

    this.runHistory.set(runId, result);
    return result;
  }

  public async updateIncremental(
    changedResourceIds: string[],
    context?: DependencyContext
  ): Promise<FeatureDependencyResult> {
    const startedAt = Date.now();
    const runId = `run_inc_${randomUUID().slice(0, 8)}`;
    const affectedFeatureIds = new Set<string>();

    const allFeatures = this.registry.getAll();
    const effectiveContext = context || {
      workspaceId: 'default',
      repositoryId: 'default',
    };

    // Find affected features through context mappings or resource string matches
    if (effectiveContext.featureMappings) {
      for (const mapping of effectiveContext.featureMappings) {
        if (changedResourceIds.includes(mapping.resourceId)) {
          affectedFeatureIds.add(mapping.featureId);
        }
      }
    }

    if (affectedFeatureIds.size === 0) {
      for (const resId of changedResourceIds) {
        for (const feat of allFeatures) {
          if (resId.toLowerCase().includes(feat.name.toLowerCase()) || resId.toLowerCase().includes(feat.id.toLowerCase())) {
            affectedFeatureIds.add(feat.id);
          }
        }
      }
    }

    const allNew: FeatureRelationship[] = [];
    const allUpdated: FeatureRelationship[] = [];
    const allDeactivated: FeatureRelationship[] = [];
    const allConflicts: any[] = [];
    const allRels: FeatureRelationship[] = [];

    for (const fId of affectedFeatureIds) {
      const singleRes = await this.discoverRelationships(fId, effectiveContext);
      allNew.push(...singleRes.newRelationships);
      allUpdated.push(...singleRes.updatedRelationships);
      allDeactivated.push(...singleRes.deactivatedRelationships);
      allConflicts.push(...singleRes.conflicts);
      allRels.push(...singleRes.relationships);
    }

    const cycles = this.graph.detectCycles();
    const completedAt = Date.now();

    const stats: FeatureDependencyStatistics = {
      featuresEvaluated: affectedFeatureIds.size,
      candidateRelationships: allRels.length,
      relationshipsCreated: allNew.length,
      relationshipsUpdated: allUpdated.length,
      relationshipsDeactivated: allDeactivated.length,
      conflictsDetected: allConflicts.length,
      cyclesDetected: cycles.length,
      sourcesExecuted: this.sources.length * affectedFeatureIds.size,
      duration: completedAt - startedAt,
      slmCalls: 0,
      tokensUsed: 0,
    };

    const result: FeatureDependencyResult = {
      runId,
      startedAt,
      completedAt,
      relationships: allRels,
      newRelationships: allNew,
      updatedRelationships: allUpdated,
      deactivatedRelationships: allDeactivated,
      conflicts: allConflicts,
      cycles,
      statistics: stats,
    };

    this.runHistory.set(runId, result);
    return result;
  }

  public async getDependencies(featureId: string): Promise<Feature[]> {
    return this.graph.getDependencies(featureId);
  }

  public async getDependents(featureId: string): Promise<Feature[]> {
    return this.graph.getDependents(featureId);
  }

  public async getRelationships(featureId: string): Promise<FeatureRelationship[]> {
    return this.repository.getRelationships(featureId);
  }

  public async getRelationship(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureRelationship | null> {
    return this.repository.getBetween(sourceFeatureId, targetFeatureId);
  }

  public async findPath(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureDependencyPath | null> {
    return this.graph.findPath(sourceFeatureId, targetFeatureId);
  }

  public async findDependencyChain(featureId: string): Promise<{
    upstream: Feature[];
    downstream: Feature[];
    paths: FeatureDependencyPath[];
  }> {
    return this.graph.findDependencyChain(featureId);
  }

  public async detectCycles(): Promise<FeatureDependencyCycle[]> {
    return this.graph.detectCycles();
  }

  public async explainRelationship(relationshipId: string): Promise<Record<string, any>> {
    const rel = await this.repository.get(relationshipId);
    if (!rel) {
      throw new FeatureDependencyError(`Relationship "${relationshipId}" not found`);
    }

    const source = this.findFeature(rel.sourceFeatureId);
    const target = this.findFeature(rel.targetFeatureId);
    return this.explainer.explainRelationship(rel, source, target);
  }

  public getDependencyRun(runId: string): FeatureDependencyResult | undefined {
    return this.runHistory.get(runId);
  }

  private findFeature(idOrName: string): Feature | undefined {
    const byId = this.registry.getSync(idOrName as any);
    if (byId) return byId;

    const byName = this.registry.getByName(idOrName);
    if (byName) return byName;

    const all = this.registry.getAll();
    return all.find((f) => f.id === idOrName || f.name.toLowerCase() === idOrName.toLowerCase());
  }

  private emit(event: string, payload: any): void {
    if (this.eventPublisher) {
      try {
        this.eventPublisher.publish(event, payload);
      } catch {
        // Suppress publication failures
      }
    }
  }
}
