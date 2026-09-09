import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class StabilityRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'StabilityRiskDetector';
  public readonly riskType: FeatureRiskType = 'STABILITY';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const stabSignals = signals.filter(
      (s) =>
        s.signalType === 'HIGH_CHURN_RATE' ||
        s.signalType === 'FREQUENT_BUG_FIXES' ||
        s.signalType === 'RECENT_BREAKING_CHANGE' ||
        s.signalType === 'HOTSPOT_DETECTED' ||
        s.signalType === 'RAPID_SUCCESSIVE_CHANGES'
    );

    if (stabSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasBreakingChange = stabSignals.some((s) => s.signalType === 'RECENT_BREAKING_CHANGE');
    const hasHotspot = stabSignals.some((s) => s.signalType === 'HOTSPOT_DETECTED');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let score = 50;

    if (hasBreakingChange && hasHotspot) {
      severity = 'CRITICAL';
      score = 85;
    } else if (hasBreakingChange || hasHotspot) {
      severity = 'HIGH';
      score = 75;
    }

    const allEvidence = stabSignals.flatMap((s) => s.evidence);
    const contributingSignals = stabSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.9,
        description: `Code volatility and instability risk: High change velocity, frequent defect fixes, or recent breaking changes elevate the likelihood of regression.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
