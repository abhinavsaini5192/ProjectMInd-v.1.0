export class DependencyRelevance {
  public calculate(distance: number): number {
    if (distance === 0) return 1.0;
    if (distance === 1) return 0.9;
    if (distance === 2) return 0.7;
    if (distance === 3) return 0.4;
    return Math.max(0.1, 1 / (distance + 1));
  }
}
