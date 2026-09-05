import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingConfidence } from '../models/MappingConfidence';
import type { MappingScoreBreakdown } from '../models/MappingScore';

export interface IFeatureMappingScorer {
  scoreCandidate(candidate: MappingCandidate): {
    score: number;
    confidence: MappingConfidence;
    breakdown: MappingScoreBreakdown;
  };
}
