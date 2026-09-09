import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class ArchitectureRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'ArchitectureRiskDetector';
  public readonly riskType: FeatureRiskType = 'ARCHITECTURE';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const archSignals = signals.filter(
      (s) =>
        s.signalType === 'LAYER_VIOLATION' ||
        s.signalType === 'CROSS_DOMAIN_LEAK' ||
        s.signalType === 'BYPASSED_ABSTRACTION' ||
        s.signalType === 'SHARED_DATABASE_TABLE' ||
        s.signalType === 'CIRCULAR_MODULE_REFERENCE' ||
        s.signalType === 'ORPHAN_FEATURE_COMPONENT'
    );

    if (archSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasLayerViolation = archSignals.some((s) => s.signalType === 'LAYER_VIOLATION');
    const hasSharedDb = archSignals.some((s) => s.signalType === 'SHARED_DATABASE_TABLE');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let score = 55;

    if (hasLayerViolation) {
      severity = 'HIGH';
      score = 75;
    } else if (hasSharedDb) {
      severity = 'MEDIUM';
      score = 65;
    }

    const allEvidence = archSignals.flatMap((s) => s.evidence);
    const contributingSignals = archSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.9,
        description: `Architectural boundary integrity risk: Feature violates architectural tier boundaries, shares database entities across domains, or bypasses abstractions.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
