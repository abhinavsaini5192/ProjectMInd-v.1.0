import type { IFeatureRiskDetector } from '../interfaces/IFeatureRiskDetector.js';
import type { HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import { RiskDetectorHelper } from '../risks/RiskDetectorHelper.js';
import { HighCouplingRiskDetector } from '../risks/HighCouplingRiskDetector.js';
import { DependencyRiskDetector } from '../risks/DependencyRiskDetector.js';
import { VerificationRiskDetector } from '../risks/VerificationRiskDetector.js';
import { BehaviorRiskDetector } from '../risks/BehaviorRiskDetector.js';
import { ArchitectureRiskDetector } from '../risks/ArchitectureRiskDetector.js';
import { StabilityRiskDetector } from '../risks/StabilityRiskDetector.js';
import { IntegrationRiskDetector } from '../risks/IntegrationRiskDetector.js';
import { SecurityRiskDetector } from '../risks/SecurityRiskDetector.js';
import { ComplexityRiskDetector } from '../risks/ComplexityRiskDetector.js';
import { ConfidenceRiskDetector } from '../risks/ConfidenceRiskDetector.js';
import { CircularDependencyRiskDetector } from '../risks/CircularDependencyRiskDetector.js';

export class FeatureRiskDetector {
  private readonly detectors: IFeatureRiskDetector[];

  constructor(customDetectors?: IFeatureRiskDetector[]) {
    this.detectors = customDetectors || [
      new HighCouplingRiskDetector(),
      new DependencyRiskDetector(),
      new VerificationRiskDetector(),
      new BehaviorRiskDetector(),
      new ArchitectureRiskDetector(),
      new StabilityRiskDetector(),
      new IntegrationRiskDetector(),
      new SecurityRiskDetector(),
      new ComplexityRiskDetector(),
      new ConfidenceRiskDetector(),
      new CircularDependencyRiskDetector()
    ];
  }

  public async detectAll(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]> {
    const rawRisks: FeatureRisk[] = [];

    for (const detector of this.detectors) {
      try {
        const detected = await detector.detect(context, signals);
        rawRisks.push(...detected);
      } catch (err) {
        // Individual detector errors do not crash whole analysis pipeline
        console.warn(`[FeatureRiskDetector] Detector ${detector.id} failed:`, err);
      }
    }

    return RiskDetectorHelper.deduplicateRisks(rawRisks);
  }
}
