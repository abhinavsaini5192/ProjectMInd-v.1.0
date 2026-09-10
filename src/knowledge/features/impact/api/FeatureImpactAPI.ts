import type { IFeatureImpactEngine } from '../interfaces/IFeatureImpactEngine.js';
import type { IImpactRepository } from '../interfaces/IImpactRepository.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { ChangeTarget } from '../models/ChangeTarget.js';
import type { ImpactResult } from '../models/ImpactResult.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactConflict } from '../models/ImpactConflict.js';
import type { ImpactAnalysisOptions } from '../interfaces/IImpactSource.js';
import { ImpactNormalizer, type RawChangeInput } from '../core/ImpactNormalizer.js';

export class FeatureImpactAPI {
  private engine: IFeatureImpactEngine;
  private repository: IImpactRepository;

  constructor(engine: IFeatureImpactEngine, repository: IImpactRepository) {
    this.engine = engine;
    this.repository = repository;
  }

  public async analyzeChange(
    change: RawChangeInput | ChangeImpact,
    options?: ImpactAnalysisOptions
  ): Promise<ImpactResult> {
    const normalized = ImpactNormalizer.normalizeChange(change);
    return this.engine.analyzeChange(normalized, options);
  }

  public async analyzeChanges(
    changes: Array<RawChangeInput | ChangeImpact>,
    options?: ImpactAnalysisOptions
  ): Promise<ImpactResult> {
    const normalized = changes.map((c) => ImpactNormalizer.normalizeChange(c));
    return this.engine.analyzeChanges(normalized, options);
  }

  public async analyzeResource(
    resourceId: string,
    options?: ImpactAnalysisOptions
  ): Promise<ImpactResult> {
    return this.engine.analyzeResource(resourceId, options);
  }

  public async analyzeFeature(
    featureId: string,
    options?: ImpactAnalysisOptions
  ): Promise<ImpactResult> {
    return this.engine.analyzeFeature(featureId, options);
  }

  public async analyzeIncremental(
    changes: Array<RawChangeInput | ChangeImpact>,
    options?: ImpactAnalysisOptions
  ): Promise<ImpactResult> {
    const normalized = changes.map((c) => ImpactNormalizer.normalizeChange(c));
    return this.engine.analyzeIncremental(normalized, options);
  }

  public async getImpact(impactId: string): Promise<FeatureImpact | ResourceImpact | null> {
    return this.engine.getImpact(impactId);
  }

  public async getFeatureImpacts(featureId: string, activeOnly: boolean = true): Promise<FeatureImpact[]> {
    return this.repository.getFeatureImpacts(featureId, activeOnly);
  }

  public async getResourceImpacts(resourceId: string, activeOnly: boolean = true): Promise<ResourceImpact[]> {
    return this.repository.getResourceImpacts(resourceId, activeOnly);
  }

  public async getDirectImpacts(targetIdOrFeatureId: string): Promise<FeatureImpact[]> {
    const all = await this.repository.getAllFeatureImpacts();
    return all.filter((f) => f.direct && (f.targetFeatureId === targetIdOrFeatureId || f.contributingChanges.some((c) => c.targetId === targetIdOrFeatureId)));
  }

  public async getIndirectImpacts(targetIdOrFeatureId: string): Promise<FeatureImpact[]> {
    const all = await this.repository.getAllFeatureImpacts();
    return all.filter((f) => !f.direct && (f.targetFeatureId === targetIdOrFeatureId || f.contributingChanges.some((c) => c.targetId === targetIdOrFeatureId)));
  }

  public async getImpactPath(pathId: string): Promise<ImpactPath | null> {
    return this.repository.getImpactPath(pathId);
  }

  public async findImpactPaths(source: string, target: string): Promise<ImpactPath[]> {
    return this.repository.findImpactPaths(source, target);
  }

  public async getAffectedFeatures(change: RawChangeInput | ChangeImpact): Promise<FeatureImpact[]> {
    const result = await this.analyzeChange(change);
    return result.featureImpacts;
  }

  public async getAffectedResources(change: RawChangeInput | ChangeImpact): Promise<ResourceImpact[]> {
    const result = await this.analyzeChange(change);
    return result.resourceImpacts;
  }

  public async getImpactConflicts(runId?: string): Promise<ImpactConflict[]> {
    return this.repository.getConflicts(runId);
  }

  public async explainImpact(impactId: string): Promise<string> {
    const impact = await this.getImpact(impactId);
    if (!impact) {
      return `Impact "${impactId}" not found.`;
    }

    if ('targetFeatureId' in impact) {
      const paths = await this.repository.findImpactPaths(impact.sourceFeatureId || '', impact.targetFeatureId);
      const relatedTests = await this.repository.getAllResourceImpacts({ impactType: 'VERIFICATION' });
      return (this.engine as any).getExplainer().explainFeatureImpact(impact, paths, relatedTests);
    } else {
      return `Resource Impact for "${impact.affectedResourceId}" (Severity: ${impact.severity}, Score: ${impact.score}/100)`;
    }
  }

  public async explainChange(change: RawChangeInput | ChangeImpact): Promise<string> {
    const result = await this.analyzeChange(change);
    const normalized = ImpactNormalizer.normalizeChange(change);
    return (this.engine as any).getExplainer().explainChange(
      normalized,
      result.featureImpacts,
      result.resourceImpacts,
      result.impactPaths
    );
  }

  public async getImpactRun(runId: string): Promise<ImpactResult | null> {
    return this.repository.getResult(runId);
  }

  public async invalidateImpact(impactId: string): Promise<void> {
    return this.engine.invalidateImpact(impactId);
  }
}
