import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskSeverity } from '../models/FeatureRiskSeverity.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import { RiskDetectorHelper } from '../risks/RiskDetectorHelper.js';

export type RiskPosture = 'CRITICAL_RISK' | 'ELEVATED_RISK' | 'MODERATE_RISK' | 'LOW_RISK';

export class FeatureRiskClassifier {
  public static classifyRiskSeverity(score: number): FeatureRiskSeverity {
    if (score >= 85) return 'CRITICAL';
    if (score >= 65) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 15) return 'LOW';
    return 'INFO';
  }

  public static classifyFeatureRiskPosture(health: FeatureHealth): RiskPosture {
    const riskScore = health.riskAssessment.overallRiskScore;
    const highestSeverity = health.riskAssessment.highestRiskSeverity;

    if (highestSeverity === 'CRITICAL' || riskScore >= 80) {
      return 'CRITICAL_RISK';
    }
    if (highestSeverity === 'HIGH' || riskScore >= 55) {
      return 'ELEVATED_RISK';
    }
    if (highestSeverity === 'MEDIUM' || riskScore >= 30) {
      return 'MODERATE_RISK';
    }
    return 'LOW_RISK';
  }

  public static compareRisks(a: FeatureRisk, b: FeatureRisk): number {
    const rankDiff = RiskDetectorHelper.getSeverityRank(b.severity) - RiskDetectorHelper.getSeverityRank(a.severity);
    if (rankDiff !== 0) return rankDiff;
    return b.score - a.score;
  }
}
