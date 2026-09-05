import type { ScoreBreakdown } from '../interfaces/IFeatureCandidateScorer';
import type { DiscoveryConfidence } from '../models/DiscoveryConfidence';

export interface CandidateScoreResult {
  candidateId: string;
  totalScore: number;
  confidence: DiscoveryConfidence;
  breakdown: ScoreBreakdown;
  calculatedAt: number;
}
