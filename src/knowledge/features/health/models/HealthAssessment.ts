import type { FeatureHealthScore } from './FeatureHealthScore.js';
import type { RiskAssessment } from './RiskAssessment.js';
import type { FeatureCriticality } from './FeatureCriticality.js';
import type { FeatureStability } from './FeatureStability.js';
import type { VerificationQuality } from './VerificationQuality.js';
import type { HealthRecommendation } from './HealthRecommendation.js';

export interface HealthAssessment {
  featureId: string;
  healthScore: FeatureHealthScore;
  riskAssessment: RiskAssessment;
  criticality: FeatureCriticality;
  stability: FeatureStability;
  verificationQuality: VerificationQuality;
  recommendations: HealthRecommendation[];
  summary: string;
  assessedAt: number;
}
