import { FeatureId } from './FeatureId';

export interface FeatureEvidence {
  evidenceId: string;
  featureId: FeatureId;
  sourceType: string;
  sourceId: string;
  reason: string;
  confidence: number;
  createdAt: number;
}
