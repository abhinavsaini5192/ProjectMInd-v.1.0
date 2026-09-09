import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class VerificationRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'VerificationRiskDetector';
  public readonly riskType: FeatureRiskType = 'VERIFICATION';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const verifSignals = signals.filter(
      (s) =>
        s.signalType === 'MISSING_TESTS' ||
        s.signalType === 'LOW_TEST_COVERAGE' ||
        s.signalType === 'NO_INTEGRATION_TESTS' ||
        s.signalType === 'UNTESTED_CRITICAL_FLOW' ||
        s.signalType === 'FLAKY_TEST_HISTORY'
    );

    if (verifSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasMissingTests = verifSignals.some((s) => s.signalType === 'MISSING_TESTS');
    const hasUntestedCritical = verifSignals.some((s) => s.signalType === 'UNTESTED_CRITICAL_FLOW');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let score = 55;

    if (hasUntestedCritical) {
      severity = 'CRITICAL';
      score = 90;
    } else if (hasMissingTests) {
      severity = 'HIGH';
      score = 80;
    }

    const allEvidence = verifSignals.flatMap((s) => s.evidence);
    const contributingSignals = verifSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.95,
        description: `Verification defect risk: Feature has inadequate test coverage or critical execution flows that are untested.`,
        evidence: allEvidence,
        contributingSignals,
        affectedResources: (context.mappings || []).filter((m) => m.role === 'TEST').map((m) => m.resourceId)
      })
    ];
  }
}
