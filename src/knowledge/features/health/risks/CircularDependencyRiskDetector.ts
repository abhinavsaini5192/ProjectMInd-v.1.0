import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class CircularDependencyRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'CircularDependencyRiskDetector';
  public readonly riskType: FeatureRiskType = 'CIRCULAR_DEPENDENCY';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const circSignals = signals.filter((s) => s.signalType === 'CIRCULAR_FEATURE_DEPENDENCY');

    if (circSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const allEvidence = circSignals.flatMap((s) => s.evidence);
    const contributingSignals = circSignals.map((s) => s.signalId);
    const paths = circSignals.map((s) => s.value).filter((v) => typeof v === 'string') as string[];

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity: 'CRITICAL',
        score: 95,
        confidence: 0.98,
        description: `Circular feature dependency deadlock risk: Feature is trapped in a dependency cycle (${paths.join('; ')}), breaking topological ordering and isolation.`,
        evidence: allEvidence,
        contributingSignals,
        affectedResources: (context.dependencies || []).map((d) => d.providerFeatureId)
      })
    ];
  }
}
