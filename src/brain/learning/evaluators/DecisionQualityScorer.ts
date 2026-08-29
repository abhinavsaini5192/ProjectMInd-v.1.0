import { Outcome } from '../models/Outcome';

export class DecisionQualityScorer {
  public score(outcome: Outcome, contextUtilityScore: number, regressions: string[], iterations: number): number {
    let score = 0.5;

    if (outcome === Outcome.SUCCESS) score += 0.4;
    if (outcome === Outcome.PARTIAL_SUCCESS) score += 0.1;
    if (outcome === Outcome.FAILED || outcome === Outcome.ABANDONED) score -= 0.3;

    score += (contextUtilityScore * 0.2); // Up to 0.2 boost for great context
    score -= (regressions.length * 0.2); // Heavy penalty for regressions
    score -= (iterations > 3 ? 0.1 : 0); // Penalty for struggling

    return Math.max(0.0, Math.min(1.0, score));
  }
}
