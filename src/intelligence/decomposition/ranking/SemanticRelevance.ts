export class SemanticRelevance {
  public calculate(contentOrSummary: string, keywords: string[]): number {
    if (keywords.length === 0) return 0.5;
    const text = contentOrSummary.toLowerCase();
    let matches = 0;

    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(1.0, 0.3 + (matches / keywords.length) * 0.7);
  }
}
