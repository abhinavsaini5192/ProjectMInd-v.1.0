import type { HealthSignalSeverity } from './HealthSignalSeverity.js';
import type { HealthSignalType } from './HealthSignalType.js';
import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export interface HealthSignal {
  signalId: string;
  featureId: string;
  signalType: HealthSignalType;
  severity: HealthSignalSeverity;
  value: number | string | boolean;
  normalizedValue: number; // 0 to 100 (or 0 to 1 normalized metric)
  description: string;
  evidence: FeatureRiskEvidence[];
  source: string;
  confidence: number; // 0 to 1
  detectedAt: number;
  knowledgeVersion: string;
}
