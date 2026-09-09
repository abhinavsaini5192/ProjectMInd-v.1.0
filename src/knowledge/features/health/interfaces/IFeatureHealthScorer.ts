import type { HealthContext, HealthConfiguration } from './IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureHealthDimension, FeatureHealthDimensionResult } from '../models/FeatureHealthDimension.js';
import type { FeatureHealthScore } from '../models/FeatureHealthScore.js';
import type { RiskAssessment } from '../models/RiskAssessment.js';
import type { FeatureCriticality } from '../models/FeatureCriticality.js';
import type { FeatureStability } from '../models/FeatureStability.js';
import type { VerificationQuality } from '../models/VerificationQuality.js';

export interface IFeatureHealthScorer {
  scoreDimensions(
    signals: HealthSignal[],
    config?: HealthConfiguration
  ): Record<FeatureHealthDimension, FeatureHealthDimensionResult>;

  calculateOverallHealth(
    dimensionScores: Record<FeatureHealthDimension, FeatureHealthDimensionResult>
  ): FeatureHealthScore;

  assessRisks(risks: FeatureRisk[]): RiskAssessment;

  calculateCriticality(context: HealthContext): FeatureCriticality;

  calculateStability(context: HealthContext, signals: HealthSignal[]): FeatureStability;

  calculateVerificationQuality(context: HealthContext, signals: HealthSignal[]): VerificationQuality;
}
