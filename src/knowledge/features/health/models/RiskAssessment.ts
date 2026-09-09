import type { FeatureRisk } from './FeatureRisk.js';
import type { FeatureRiskSeverity } from './FeatureRiskSeverity.js';

export interface RiskAssessment {
  overallRiskScore: number; // 0 to 100 (0 = no risk, 100 = catastrophic risk exposure)
  highestRiskSeverity: FeatureRiskSeverity;
  risks: FeatureRisk[];
  riskCount: number;
  confidence: number; // 0 to 1
  evaluatedAt: number;
}
