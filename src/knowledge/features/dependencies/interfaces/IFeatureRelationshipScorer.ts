import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipConfidence } from '../models/FeatureRelationshipConfidence';
import type { FeatureRelationshipScoreBreakdown } from '../models/FeatureRelationshipScore';

export interface IFeatureRelationshipScorer {
  scoreCandidate(candidate: FeatureRelationshipCandidate): {
    score: number;
    confidence: FeatureRelationshipConfidence;
    breakdown: FeatureRelationshipScoreBreakdown;
  };
}
