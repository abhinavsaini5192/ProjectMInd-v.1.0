export class ContextUtilityScorer {
  public score(useful: string[], unused: string[], missing: string[], misleading: string[]): number {
    let score = 1.0;

    score -= (unused.length * 0.05);
    score -= (missing.length * 0.1);
    score -= (misleading.length * 0.2);

    return Math.max(0.0, Math.min(1.0, score));
  }
}
