import type { HealthContext } from './IFeatureHealthSignal.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureHealthScore } from '../models/FeatureHealthScore.js';
import type { RiskAssessment } from '../models/RiskAssessment.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { HealthRecommendation } from '../models/HealthRecommendation.js';
import type { FeatureHealthConflict } from '../models/FeatureHealthConflict.js';
import type { HealthAnalysisMode } from '../models/FeatureHealthVersion.js';

export interface IFeatureHealthAnalyzer {
  analyzeFeature(context: HealthContext, mode?: HealthAnalysisMode): Promise<FeatureHealth>;

  generateRecommendations(
    healthScore: FeatureHealthScore,
    riskAssessment: RiskAssessment,
    signals: HealthSignal[]
  ): HealthRecommendation[];

  detectConflicts(signals: HealthSignal[], risks: FeatureRisk[]): FeatureHealthConflict[];
}
