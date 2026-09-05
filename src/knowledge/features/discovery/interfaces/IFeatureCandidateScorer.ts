import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryConfidence } from '../models/DiscoveryConfidence';

export interface ScoreBreakdown {
  endpointScore: number;
  symbolScore: number;
  dependencyScore: number;
  moduleScore: number;
  testScore: number;
  configScore: number;
  docScore: number;
  historyScore: number;
  coherenceScore: number;
  totalScore: number;
}

export interface IFeatureCandidateScorer {
  scoreCandidate(candidate: FeatureCandidate): { score: number; confidence: DiscoveryConfidence; breakdown: ScoreBreakdown };
}
