export interface FeatureBehaviorEvidence {
  evidenceId: string;
  flowId?: string;
  sourceType: string;
  sourceId: string;
  evidenceType: string;
  description: string;
  strength: number;
  confidence: number;
  metadata: Record<string, any>;
  timestamp: number;
}
