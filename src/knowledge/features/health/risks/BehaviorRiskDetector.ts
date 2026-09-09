import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class BehaviorRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'BehaviorRiskDetector';
  public readonly riskType: FeatureRiskType = 'BEHAVIOR';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const behSignals = signals.filter(
      (s) =>
        s.signalType === 'COMPLEX_EXECUTION_FLOW' ||
        s.signalType === 'DEAD_END_FLOW' ||
        s.signalType === 'UNHANDLED_ERROR_PATH' ||
        s.signalType === 'ASYNC_RACE_CONDITION' ||
        s.signalType === 'UNTERMINATED_FLOW'
    );

    if (behSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasUnhandledError = behSignals.some((s) => s.signalType === 'UNHANDLED_ERROR_PATH');
    const hasAsyncRace = behSignals.some((s) => s.signalType === 'ASYNC_RACE_CONDITION');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let score = 50;

    if (hasUnhandledError || hasAsyncRace) {
      severity = 'HIGH';
      score = 75;
    }

    const allEvidence = behSignals.flatMap((s) => s.evidence);
    const contributingSignals = behSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.88,
        description: `Runtime execution behavior risk: Behavioral flows contain unhandled error paths or high branching complexity.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
