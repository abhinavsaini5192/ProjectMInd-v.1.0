import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class IntegrationRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'IntegrationRiskDetector';
  public readonly riskType: FeatureRiskType = 'INTEGRATION';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const intSignals = signals.filter(
      (s) =>
        s.signalType === 'UNDOCUMENTED_API_ENDPOINT' ||
        s.signalType === 'MISSING_TIMEOUT_CONFIGURATION' ||
        s.signalType === 'MISSING_CIRCUIT_BREAKER' ||
        s.signalType === 'UNVALIDATED_EXTERNAL_INPUT' ||
        s.signalType === 'UNRETRYABLE_NETWORK_CALL'
    );

    if (intSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasMissingTimeout = intSignals.some((s) => s.signalType === 'MISSING_TIMEOUT_CONFIGURATION');
    const hasMissingCircuitBreaker = intSignals.some((s) => s.signalType === 'MISSING_CIRCUIT_BREAKER');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let score = 40;

    if (hasMissingTimeout && hasMissingCircuitBreaker) {
      severity = 'HIGH';
      score = 75;
    } else if (hasMissingTimeout || hasMissingCircuitBreaker) {
      severity = 'MEDIUM';
      score = 60;
    }

    const allEvidence = intSignals.flatMap((s) => s.evidence);
    const contributingSignals = intSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.88,
        description: `External service & API integration resilience risk: Remote integrations lack defensive resilience mechanisms like timeouts and circuit breakers.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
