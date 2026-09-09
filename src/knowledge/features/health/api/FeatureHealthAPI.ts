import type { IFeatureHealthEngine } from '../interfaces/IFeatureHealthEngine.js';
import type { IFeatureHealthRepository } from '../interfaces/IFeatureHealthRepository.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthResult } from '../models/FeatureHealthResult.js';
import type { HealthAssessment } from '../models/HealthAssessment.js';
import { FeatureHealthExplainer } from '../core/FeatureHealthExplainer.js';
import { InvalidHealthReferenceError } from '../errors/InvalidHealthReferenceError.js';

export class FeatureHealthAPI {
  private engine: IFeatureHealthEngine;
  private repository: IFeatureHealthRepository;
  private explainer: FeatureHealthExplainer;

  constructor(engine: IFeatureHealthEngine, repository: IFeatureHealthRepository) {
    this.engine = engine;
    this.repository = repository;
    this.explainer = new FeatureHealthExplainer();
  }

  public async analyzeFeature(featureId: string): Promise<HealthAssessment> {
    const health = await this.engine.analyzeFeature(featureId, 'FULL');
    const summary = this.explainer.explainHealth(health);

    return {
      featureId: health.featureId,
      healthScore: health.healthScore,
      riskAssessment: health.riskAssessment,
      criticality: health.criticality,
      stability: health.stability,
      verificationQuality: health.verificationQuality,
      recommendations: health.recommendations,
      summary,
      assessedAt: Date.now()
    };
  }

  public async analyzeRepository(
    workspaceId: string,
    repositoryId: string
  ): Promise<FeatureHealthResult> {
    return this.engine.analyze({
      workspaceId,
      repositoryId,
      mode: 'FULL'
    });
  }

  public async getFeatureHealth(featureId: string): Promise<FeatureHealth | null> {
    return this.repository.getByFeatureId(featureId);
  }

  public async explainFeatureHealth(featureId: string): Promise<string> {
    const health = await this.repository.getByFeatureId(featureId);
    if (!health) {
      throw new InvalidHealthReferenceError('FeatureHealth', featureId);
    }
    return this.explainer.explainHealth(health);
  }

  public async queryHighRiskFeatures(): Promise<FeatureHealth[]> {
    const all = await this.repository.getAll();
    return all.filter(
      (h) =>
        h.riskAssessment.highestRiskSeverity === 'CRITICAL' ||
        h.riskAssessment.highestRiskSeverity === 'HIGH' ||
        h.healthScore.status === 'HIGH_RISK' ||
        h.healthScore.status === 'CRITICAL'
    );
  }

  public async queryDegradedFeatures(): Promise<FeatureHealth[]> {
    const all = await this.repository.getAll();
    return all.filter(
      (h) =>
        h.healthScore.status === 'DEGRADED' ||
        h.healthScore.status === 'ATTENTION_REQUIRED'
    );
  }

  public async markFeaturesStale(featureIds: string[]): Promise<void> {
    await this.repository.markStale(featureIds);
  }
}
