import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class ConfidenceRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'ConfidenceRiskDetector';
  public readonly riskType: FeatureRiskType = 'CONFIDENCE';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const confSignals = signals.filter(
      (s) =>
        s.signalType === 'LOW_DISCOVERY_CONFIDENCE' ||
        s.signalType === 'DISPUTED_RESOURCE_MAPPING' ||
        s.signalType === 'STALE_KNOWLEDGE' ||
        s.signalType === 'LOW_MAPPING_CONFIDENCE'
    );

    if (confSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasStale = confSignals.some((s) => s.signalType === 'STALE_KNOWLEDGE');
    const hasLowDiscovery = confSignals.some((s) => s.signalType === 'LOW_DISCOVERY_CONFIDENCE');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let score = 35;

    if (hasStale && hasLowDiscovery) {
      severity = 'HIGH';
      score = 75;
    } else if (hasStale || hasLowDiscovery) {
      severity = 'MEDIUM';
      score = 55;
    }

    const allEvidence = confSignals.flatMap((s) => s.evidence);
    const contributingSignals = confSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.85,
        description: `Knowledge confidence and staleness risk: The intelligence model has low certainty or out-of-date evidence regarding this feature.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
