export interface FeatureRiskEvidence {
  evidenceId: string;
  sourceType: string;
  sourceId: string;
  evidenceType: string;
  description: string;
  strength: number;
  confidence: number;
  metadata?: Record<string, any>;
  timestamp: number;
}
