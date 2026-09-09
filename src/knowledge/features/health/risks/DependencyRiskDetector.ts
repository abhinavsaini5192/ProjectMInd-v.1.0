import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class DependencyRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'DependencyRiskDetector';
  public readonly riskType: FeatureRiskType = 'DEPENDENCY';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const depSignals = signals.filter(
      (s) =>
        s.signalType === 'EXCESSIVE_DEPENDENCIES' ||
        s.signalType === 'DEPRECATED_DEPENDENCY' ||
        s.signalType === 'OUTDATED_DEPENDENCY' ||
        s.signalType === 'UNPINNED_DEPENDENCY'
    );

    if (depSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasDeprecated = depSignals.some((s) => s.signalType === 'DEPRECATED_DEPENDENCY');
    const hasExcessive = depSignals.some((s) => s.signalType === 'EXCESSIVE_DEPENDENCIES');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let score = 30;

    if (hasDeprecated && hasExcessive) {
      severity = 'HIGH';
      score = 80;
    } else if (hasDeprecated || hasExcessive) {
      severity = 'MEDIUM';
      score = 60;
    }

    const allEvidence = depSignals.flatMap((s) => s.evidence);
    const contributingSignals = depSignals.map((s) => s.signalId);
    const affectedResources = depSignals
      .filter((s) => typeof s.value === 'string')
      .map((s) => s.value as string);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.88,
        description: `External and upstream dependency risk: Feature relies on excessive, unpinned, or deprecated dependencies.`,
        evidence: allEvidence,
        contributingSignals,
        affectedResources
      })
    ];
  }
}
