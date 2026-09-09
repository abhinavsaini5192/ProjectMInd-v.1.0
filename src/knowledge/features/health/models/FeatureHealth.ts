import type { FeatureHealthScore } from './FeatureHealthScore.js';
import type { RiskAssessment } from './RiskAssessment.js';
import type { FeatureCriticality } from './FeatureCriticality.js';
import type { FeatureStability } from './FeatureStability.js';
import type { VerificationQuality } from './VerificationQuality.js';
import type { HealthRecommendation } from './HealthRecommendation.js';
import type { HealthSignal } from './HealthSignal.js';
import type { FeatureHealthConflict } from './FeatureHealthConflict.js';
import type { FeatureHealthVersion } from './FeatureHealthVersion.js';

export interface FeatureHealth {
  healthId: string;
  featureId: string;
  healthScore: FeatureHealthScore;
  riskAssessment: RiskAssessment;
  criticality: FeatureCriticality;
  stability: FeatureStability;
  verificationQuality: VerificationQuality;
  recommendations: HealthRecommendation[];
  signals: HealthSignal[];
  conflicts: FeatureHealthConflict[];
  version: FeatureHealthVersion;
  metadata: Record<string, unknown>;
  isStale: boolean;
  createdAt: number;
  updatedAt: number;
}
