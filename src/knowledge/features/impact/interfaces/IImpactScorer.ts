import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ImpactContext } from './IImpactSource.js';

export interface IImpactScorer {
  scoreImpact(candidate: ImpactCandidate, context: ImpactContext): number;
  prioritizeImpacts(impacts: FeatureImpact[]): FeatureImpact[];
}
