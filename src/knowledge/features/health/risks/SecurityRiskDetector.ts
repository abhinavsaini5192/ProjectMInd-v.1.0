import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import { RiskDetectorHelper } from './RiskDetectorHelper.js';

export class SecurityRiskDetector implements IFeatureRiskDetector {
  public readonly id = 'SecurityRiskDetector';
  public readonly riskType: FeatureRiskType = 'SECURITY';

  public async detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const secSignals = signals.filter(
      (s) =>
        s.signalType === 'EXPOSED_SECRET' ||
        s.signalType === 'MISSING_AUTHENTICATION' ||
        s.signalType === 'INSECURE_CONFIGURATION' ||
        s.signalType === 'PERMISSIVE_CORS' ||
        s.signalType === 'UNVALIDATED_INPUT' ||
        s.signalType === 'PROMPT_INJECTION_VULNERABILITY'
    );

    if (secSignals.length === 0) {
      return [];
    }

    const featureId = context.feature.featureId;
    const hasSecret = secSignals.some((s) => s.signalType === 'EXPOSED_SECRET');
    const hasMissingAuth = secSignals.some((s) => s.signalType === 'MISSING_AUTHENTICATION');
    const hasPromptInjection = secSignals.some((s) => s.signalType === 'PROMPT_INJECTION_VULNERABILITY');

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH';
    let score = 70;

    if (hasSecret || hasMissingAuth || hasPromptInjection) {
      severity = 'CRITICAL';
      score = 95;
    }

    const allEvidence = secSignals.flatMap((s) => s.evidence);
    const contributingSignals = secSignals.map((s) => s.signalId);

    return [
      RiskDetectorHelper.createRisk({
        featureId,
        riskType: this.riskType,
        severity,
        score,
        confidence: 0.95,
        description: `Security vulnerability risk: High-severity security issues detected such as exposed credentials, unauthenticated endpoints, or prompt injection hazards.`,
        evidence: allEvidence,
        contributingSignals
      })
    ];
  }
}
