import type { IFeatureImpactEngine } from '../interfaces/IFeatureImpactEngine.js';
import type { IImpactRepository } from '../interfaces/IImpactRepository.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { ImpactResult } from '../models/ImpactResult.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactAnalysisOptions } from '../interfaces/IImpactSource.js';
import { FeatureImpactCoordinator } from './FeatureImpactCoordinator.js';
import { FeatureImpactAnalyzer } from './FeatureImpactAnalyzer.js';
import { ImpactExplainer } from './ImpactExplainer.js';
import { ImpactNormalizer } from './ImpactNormalizer.js';
import { FeatureImpactEvents } from '../events/FeatureImpactEvents.js';
import type { IEventBus } from '../../../../workspace/interfaces/IEventBus.js';

export interface EngineDependencies {
  coordinator?: FeatureImpactCoordinator;
  analyzer?: FeatureImpactAnalyzer;
  explainer?: ImpactExplainer;
  eventBus?: IEventBus;
}

export class FeatureImpactEngine implements IFeatureImpactEngine {
  private repository?: IImpactRepository | undefined;
  private coordinator: FeatureImpactCoordinator;
  private analyzer: FeatureImpactAnalyzer;
  private explainer: ImpactExplainer;
  private eventBus?: IEventBus | undefined;

  // In-memory cache: cacheKey -> ImpactResult
  private cache = new Map<string, ImpactResult>();

  constructor(repository?: IImpactRepository, deps: EngineDependencies = {}) {
    this.repository = repository;
    this.coordinator = deps.coordinator || new FeatureImpactCoordinator();
    this.analyzer = deps.analyzer || new FeatureImpactAnalyzer();
    this.explainer = deps.explainer || new ImpactExplainer();
    this.eventBus = deps.eventBus;
  }

  public async analyzeChange(
    change: ChangeImpact,
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactResult> {
    return this.analyzeChanges([change], options);
  }

  public async analyzeChanges(
    changes: ChangeImpact[],
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactResult> {
    const normalizedChanges = changes.map((c) => ImpactNormalizer.normalizeChange(c));
    const repoId = options.repositoryId || 'repo_default';
    const version = options.sourceChangeVersion || '1.0.0';

    // 1. Check cache (Section 48)
    const cacheKey = this.computeCacheKey(normalizedChanges, repoId, version, options.analysisMode || 'FULL');
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Publish started event (Section 51)
    this.publishEvent(FeatureImpactEvents.AnalysisStarted, {
      repositoryId: repoId,
      changeCount: normalizedChanges.length,
      mode: options.analysisMode || 'FULL',
    });

    // 3. Build context & analyze
    const context = await this.coordinator.buildContext(normalizedChanges, options);
    const result = await this.analyzer.analyze(context);

    // 4. Publish granular events
    for (const fi of result.featureImpacts) {
      this.publishEvent(FeatureImpactEvents.FeatureImpactDetected, {
        impactId: fi.impactId,
        featureId: fi.targetFeatureId,
        impactType: fi.impactType,
        severity: fi.severity,
        score: fi.score,
      });
    }

    for (const ri of result.resourceImpacts) {
      this.publishEvent(FeatureImpactEvents.ResourceImpactDetected, {
        impactId: ri.impactId,
        resourceId: ri.affectedResourceId,
        impactType: ri.impactType,
        severity: ri.severity,
      });
    }

    for (const c of result.conflicts) {
      this.publishEvent(FeatureImpactEvents.ImpactConflictDetected, {
        conflictId: c.conflictId,
        targetFeatureId: c.targetFeatureId,
        conflictType: c.conflictType,
      });
    }

    // 5. Persist to repository if present
    if (this.repository) {
      await this.repository.saveResult(result);
    }

    // 6. Cache result
    this.cache.set(cacheKey, result);

    // 7. Publish completed event
    this.publishEvent(FeatureImpactEvents.AnalysisCompleted, {
      runId: result.runId,
      repositoryId: repoId,
      featuresAffected: result.featureImpacts.length,
      resourcesAffected: result.resourceImpacts.length,
      pathsGenerated: result.impactPaths.length,
    });

    return result;
  }

  public async analyzeIncremental(
    changes: ChangeImpact[],
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactResult> {
    const incrementalOptions: ImpactAnalysisOptions = {
      ...options,
      analysisMode: 'INCREMENTAL',
    };

    const result = await this.analyzeChanges(changes, incrementalOptions);

    // Mark previous impacts for newly touched features as stale in repository (Section 40)
    if (this.repository) {
      const affectedFeatureIds = result.featureImpacts.map((f) => f.targetFeatureId);
      for (const fid of affectedFeatureIds) {
        await this.repository.invalidateByFeature(fid, 'SUPERSEDED_BY_INCREMENTAL_RUN');
        this.publishEvent(FeatureImpactEvents.FeatureImpactStale, {
          featureId: fid,
          reason: 'SUPERSEDED_BY_INCREMENTAL_RUN',
        });
      }
    }

    return result;
  }

  public async analyzeResource(
    resourceId: string,
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactResult> {
    const change: ChangeImpact = ImpactNormalizer.normalizeChange({
      targetId: resourceId,
      changeType: 'MODIFIED',
      filePath: resourceId.includes('/') || resourceId.includes('\\') ? resourceId : undefined,
    });
    return this.analyzeChange(change, options);
  }

  public async analyzeFeature(
    featureId: string,
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactResult> {
    const change: ChangeImpact = ImpactNormalizer.normalizeChange({
      targetId: featureId,
      featureId,
      changeType: 'MODIFIED',
    });
    return this.analyzeChange(change, options);
  }

  public async getImpact(impactId: string): Promise<FeatureImpact | ResourceImpact | null> {
    if (!this.repository) return null;

    const allFeatures = await this.repository.getAllFeatureImpacts();
    const feat = allFeatures.find((f) => f.impactId === impactId);
    if (feat) return feat;

    const allResources = await this.repository.getAllResourceImpacts();
    return allResources.find((r) => r.impactId === impactId) || null;
  }

  public async findImpactPaths(sourceId: string, targetId: string): Promise<ImpactPath[]> {
    if (this.repository) {
      return this.repository.findImpactPaths(sourceId, targetId);
    }
    return [];
  }

  public async invalidateImpact(impactId: string): Promise<void> {
    if (this.repository) {
      await this.repository.markStale([impactId], 'MANUAL_INVALIDATION');
      this.publishEvent(FeatureImpactEvents.FeatureImpactStale, {
        impactId,
        reason: 'MANUAL_INVALIDATION',
      });
    }
    this.cache.clear();
  }

  public async invalidateByFeature(featureId: string, reason: string = 'KNOWLEDGE_CHANGED'): Promise<void> {
    if (this.repository) {
      await this.repository.invalidateByFeature(featureId, reason);
      this.publishEvent(FeatureImpactEvents.FeatureImpactStale, {
        featureId,
        reason,
      });
    }
    this.cache.clear();
  }

  public getExplainer(): ImpactExplainer {
    return this.explainer;
  }

  private computeCacheKey(
    changes: ChangeImpact[],
    repositoryId: string,
    version: string,
    mode: string
  ): string {
    const changeSignature = changes
      .map((c) => `${c.target.targetId}:${c.changeType}`)
      .sort()
      .join('|');
    return `${repositoryId}:${version}:${mode}:${changeSignature}`;
  }

  private publishEvent(eventName: string, payload: any): void {
    if (this.eventBus) {
      try {
        this.eventBus.publish(eventName, payload);
      } catch (err) {
        console.warn(`[FeatureImpactEngine] Event publish error (${eventName}):`, err);
      }
    }
  }
}
