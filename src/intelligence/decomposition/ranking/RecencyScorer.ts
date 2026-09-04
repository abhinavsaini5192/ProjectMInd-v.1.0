export class RecencyScorer {
  public calculate(timestamp?: number): number {
    if (!timestamp) return 0.5;
    const now = Date.now();
    const ageMs = Math.max(0, now - timestamp);
    const hours = ageMs / (1000 * 60 * 60);

    if (hours < 1) return 1.0;
    if (hours < 24) return 0.9;
    if (hours < 168) return 0.7; // 1 week
    return 0.4;
  }
}
