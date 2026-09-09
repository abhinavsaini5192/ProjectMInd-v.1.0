import type { IFeatureHealthEngine, HealthAnalysisOptions } from '../interfaces/IFeatureHealthEngine.js';
import type { IFeatureHealthRepository } from '../interfaces/IFeatureHealthRepository.js';
import type { IFeatureHealthCoordinator } from '../interfaces/IFeatureHealthCoordinator.js';
import type { IFeatureHealthAnalyzer } from '../interfaces/IFeatureHealthAnalyzer.js';
import type { IFeatureHealthExplainer } from '../interfaces/IFeatureHealthExplainer.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthResult } from '../models/FeatureHealthResult.js';
import type { HealthAnalysisMode } from '../models/FeatureHealthVersion.js';
import { FeatureHealthCoordinator } from './FeatureHealthCoordinator.js';
import { FeatureHealthAnalyzer } from './FeatureHealthAnalyzer.js';
import { FeatureHealthExplainer } from './FeatureHealthExplainer.js';
import { InvalidHealthReferenceError } from '../errors/InvalidHealthReferenceError.js';

export class FeatureHealthEngine implements IFeatureHealthEngine {
  private repository: IFeatureHealthRepository;
  private coordinator: IFeatureHealthCoordinator;
  private analyzer: IFeatureHealthAnalyzer;
  private explainer: IFeatureHealthExplainer;

  constructor(
    repository: IFeatureHealthRepository,
    dependencies?: {
      coordinator?: IFeatureHealthCoordinator;
      analyzer?: IFeatureHealthAnalyzer;
      explainer?: IFeatureHealthExplainer;
    }
  ) {
    this.repository = repository;
    this.coordinator = dependencies?.coordinator || new FeatureHealthCoordinator();
    this.analyzer = dependencies?.analyzer || new FeatureHealthAnalyzer();
    this.explainer = dependencies?.explainer || new FeatureHealthExplainer();
  }

  public async analyze(options: HealthAnalysisOptions): Promise<FeatureHealthResult> {
    const startedAt = Date.now();
    const runId = `health_run_${startedAt}_${Math.random().toString(36).substring(2, 7)}`;
    const mode = options.mode || (options.featureIds ? 'BATCH' : 'FULL');

    const healthResults: FeatureHealth[] = [];
    const failures: Array<{ featureId: string; error: string }> = [];
    const staleFeatures: string[] = [];

    let contexts = [];
    if (options.featureIds && options.featureIds.length > 0) {
      for (const fId of options.featureIds) {
        try {
          const ctx = await this.coordinator.buildContext(fId);
          if (options.config) {
            ctx.config = { ...ctx.config, ...options.config } as typeof ctx.config;
          }
          contexts.push(ctx);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          failures.push({ featureId: fId, error: message });
        }
      }
    } else {
      contexts = await this.coordinator.buildAllContexts(options.workspaceId, options.repositoryId);
    }

    for (const ctx of contexts) {
      const fId = ctx.feature.featureId;
      try {
        const health = await this.analyzer.analyzeFeature(ctx, mode);
        healthResults.push(health);
        await this.repository.save(health);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push({ featureId: fId, error: message });
      }
    }

    const completedAt = Date.now();
    const durationMs = completedAt - startedAt;

    let sumHealth = 0;
    let sumRisk = 0;
    let totalSignals = 0;
    let totalRisks = 0;
    let totalConflicts = 0;
    const statusCounts: Record<string, number> = {};
    const highRiskFeatureIds: string[] = [];
    const criticalRiskFeatureIds: string[] = [];

    for (const h of healthResults) {
      sumHealth += h.healthScore.overallScore;
      sumRisk += h.riskAssessment.overallRiskScore;
      totalSignals += h.signals.length;
      totalRisks += h.riskAssessment.risks.length;
      totalConflicts += h.conflicts.length;

      const st = h.healthScore.status;
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      if (h.riskAssessment.highestRiskSeverity === 'CRITICAL') {
        criticalRiskFeatureIds.push(h.featureId);
      } else if (h.riskAssessment.highestRiskSeverity === 'HIGH') {
        highRiskFeatureIds.push(h.featureId);
      }
    }

    const count = healthResults.length;
    const averageHealthScore = count > 0 ? Math.round(sumHealth / count) : 0;
    const averageRiskScore = count > 0 ? Math.round(sumRisk / count) : 0;

    return {
      runId,
      repositoryId: options.repositoryId,
      analysisMode: mode,
      startedAt,
      completedAt,
      durationMs,
      featuresAnalyzed: count,
      featuresUpdated: count,
      signalsDetected: totalSignals,
      risksDetected: totalRisks,
      conflictsDetected: totalConflicts,
      staleFeatures,
      failures,
      healthResults,
      statistics: {
        averageHealthScore,
        averageRiskScore,
        statusCounts,
        highRiskFeatureIds,
        criticalRiskFeatureIds
      }
    };
  }

  public async analyzeFeature(featureId: string, mode: HealthAnalysisMode = 'FULL'): Promise<FeatureHealth> {
    const ctx = await this.coordinator.buildContext(featureId);
    const health = await this.analyzer.analyzeFeature(ctx, mode);
    await this.repository.save(health);
    return health;
  }

  public async analyzeIncremental(changedFeatureIds: string[]): Promise<FeatureHealthResult> {
    const startedAt = Date.now();
    const runId = `health_inc_${startedAt}`;
    const healthResults: FeatureHealth[] = [];
    const failures: Array<{ featureId: string; error: string }> = [];

    // Mark changed features as stale in repository first
    await this.repository.markStale(changedFeatureIds);

    // Expand set to include directly affected dependent/provider features
    const targetFeatureIds = new Set<string>(changedFeatureIds);

    for (const fId of changedFeatureIds) {
      try {
        const ctx = await this.coordinator.buildContext(fId);
        for (const dep of ctx.dependencies || []) {
          targetFeatureIds.add(dep.providerFeatureId);
        }
        for (const dep of ctx.dependents || []) {
          targetFeatureIds.add(dep.dependentFeatureId);
        }
      } catch {
        // Continue if single context fails
      }
    }

    const featureIdsToAnalyze = Array.from(targetFeatureIds);

    for (const fId of featureIdsToAnalyze) {
      try {
        const ctx = await this.coordinator.buildContext(fId);
        const health = await this.analyzer.analyzeFeature(ctx, 'INCREMENTAL');
        healthResults.push(health);
        await this.repository.save(health);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push({ featureId: fId, error: message });
      }
    }

    const completedAt = Date.now();
    let sumHealth = 0;
    let sumRisk = 0;
    let totalSignals = 0;
    let totalRisks = 0;
    let totalConflicts = 0;
    const statusCounts: Record<string, number> = {};
    const highRiskFeatureIds: string[] = [];
    const criticalRiskFeatureIds: string[] = [];

    for (const h of healthResults) {
      sumHealth += h.healthScore.overallScore;
      sumRisk += h.riskAssessment.overallRiskScore;
      totalSignals += h.signals.length;
      totalRisks += h.riskAssessment.risks.length;
      totalConflicts += h.conflicts.length;

      const st = h.healthScore.status;
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      if (h.riskAssessment.highestRiskSeverity === 'CRITICAL') {
        criticalRiskFeatureIds.push(h.featureId);
      } else if (h.riskAssessment.highestRiskSeverity === 'HIGH') {
        highRiskFeatureIds.push(h.featureId);
      }
    }

    const count = healthResults.length;

    return {
      runId,
      repositoryId: 'incremental',
      analysisMode: 'INCREMENTAL',
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
      featuresAnalyzed: count,
      featuresUpdated: count,
      signalsDetected: totalSignals,
      risksDetected: totalRisks,
      conflictsDetected: totalConflicts,
      staleFeatures: changedFeatureIds,
      failures,
      healthResults,
      statistics: {
        averageHealthScore: count > 0 ? Math.round(sumHealth / count) : 0,
        averageRiskScore: count > 0 ? Math.round(sumRisk / count) : 0,
        statusCounts,
        highRiskFeatureIds,
        criticalRiskFeatureIds
      }
    };
  }

  public async getHealth(featureId: string): Promise<FeatureHealth | null> {
    return this.repository.getByFeatureId(featureId);
  }

  public async explain(featureId: string): Promise<string> {
    const health = await this.getHealth(featureId);
    if (!health) {
      throw new InvalidHealthReferenceError('FeatureHealth', featureId);
    }
    return this.explainer.explainHealth(health);
  }
}
