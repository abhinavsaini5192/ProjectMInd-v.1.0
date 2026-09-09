import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class HighCouplingRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'HighCouplingRiskDetector';
  public readonly riskType: FeatureRiskType = 'COUPLING';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const couplingSignals = signals.filter(
      (s) =>
        s.signalType === 'HIGH_EFFERENT_COUPLING' ||
        s.signalType === 'HIGH_AFFERENT_COUPLING' ||
        s.signalType === 'TIGHT_COUPLING' ||
        s.signalType === 'UNBALANCED_COUPLING'
    );

    if (couplingSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasUnbalanced = couplingSignals.some((s) => s.signalType === 'UNBALANCED_COUPLING');
    const hasHighEfferent = couplingSignals.some((s) => s.signalType === 'HIGH_EFFERENT_COUPLING');
    const hasHighAfferent = couplingSignals.some((s) => s.signalType === 'HIGH_AFFERENT_COUPLING');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let score = 50;

    if (hasUnbalanced || (hasHighEfferent && hasHighAfferent)) {
      severity = 'HIGH';
      score = 80;
    } else if (couplingSignals.some((s) => s.severity === 'HIGH')) {
      severity = 'HIGH';
      score = 70;
    }

    const allEvidence = couplingSignals.flatMap((s) => s.evidence);
    const contributingSignals = couplingSignals.map((s) => s.signalId);
    const affectedResources = (context.dependencies || []).map((d) => d.providerFeatureId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.9,
        description: `High architectural coupling risk: Feature is subject to strong inter-feature dependency coupling which threatens system modularity.`,
        evidence: allEvidence,
        contributingSignals,
        affectedResources
      })
    ];
  }
}
