import type { FeatureRiskType } from './FeatureRiskType.js';
import type { FeatureRiskSeverity } from './FeatureRiskSeverity.js';
import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export interface FeatureRisk {
  riskId: string;
  featureId: string;
  riskType: FeatureRiskType;
  severity: FeatureRiskSeverity;
  score: number; // 0 to 100
  confidence: number; // 0 to 1
  description: string;
  evidence: FeatureRiskEvidence[];
  contributingSignals: string[];
  affectedResources: string[];
  detectedAt: number;
  knowledgeVersion: string;
  active: boolean;
}
