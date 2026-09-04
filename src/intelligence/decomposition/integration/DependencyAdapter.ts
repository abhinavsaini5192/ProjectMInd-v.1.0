export class DependencyAdapter {
  public getDependencyDistance(fromSymbol: string, toSymbol: string): number {
    if (fromSymbol === toSymbol) return 0;
    if (fromSymbol.includes('Controller') && toSymbol.includes('Service')) return 1;
    if (fromSymbol.includes('Service') && toSymbol.includes('Repository')) return 1;
    if (fromSymbol.includes('Controller') && toSymbol.includes('Repository')) return 2;
    return 3;
  }
}
