export class ConfidenceScorer {
  public calculate(source: string, rawConfidence: number): number {
    if (source === 'CODE_AST' || source === 'STATIC_ANALYSIS') {
      return Math.min(1.0, rawConfidence * 1.0);
    }
    if (source === 'INFERRED' || source === 'HEURISTIC') {
      return Math.min(0.85, rawConfidence * 0.85);
    }
    if (source === 'MEMORY') {
      return Math.min(0.8, rawConfidence * 0.75);
    }
    return rawConfidence;
  }
}
