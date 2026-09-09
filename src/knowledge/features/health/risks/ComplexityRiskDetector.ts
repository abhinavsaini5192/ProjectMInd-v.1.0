import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class ComplexityRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'ComplexityRiskDetector';
  public readonly riskType: FeatureRiskType = 'COMPLEXITY';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const compSignals = signals.filter(
      (s) =>
        s.signalType === 'HIGH_CYCLOMATIC_COMPLEXITY' ||
        s.signalType === 'HIGH_COGNITIVE_COMPLEXITY' ||
        s.signalType === 'DEEP_NESTING' ||
        s.signalType === 'LARGE_FILE_SIZE' ||
        s.signalType === 'LARGE_METHOD_SIZE'
    );

    if (compSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasHighComplexity = compSignals.some(
      (s) => s.signalType === 'HIGH_CYCLOMATIC_COMPLEXITY' && s.severity === 'HIGH'
    );
    const hasDeepNesting = compSignals.some((s) => s.signalType === 'DEEP_NESTING' && s.severity === 'HIGH');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let score = 40;

    if (hasHighComplexity && hasDeepNesting) {
      severity = 'HIGH';
      score = 80;
    } else if (hasHighComplexity || hasDeepNesting) {
      severity = 'MEDIUM';
      score = 65;
    }

    const allEvidence = compSignals.flatMap((s) => s.evidence);
    const contributingSignals = compSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.9,
        description: `Code maintainability and cognitive complexity risk: Feature contains overly complex algorithms, deep nesting, or unwieldy file units.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
