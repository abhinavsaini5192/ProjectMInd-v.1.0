import { DependencyRegistry } from './DependencyRegistry';

export class CohesionAnalyzer {
  constructor(private registry: DependencyRegistry) {}

  public calculateCohesion(moduleSymbolId: string, internalSymbols: string[]): number {
    if (internalSymbols.length === 0) return 1.0;

    let internalLinks = 0;
    let possibleLinks = internalSymbols.length * (internalSymbols.length - 1);

    if (possibleLinks === 0) return 1.0;

    for (const sym of internalSymbols) {
      const outEdges = this.registry.getOutEdges(sym);
      for (const edge of outEdges) {
        const target = this.registry.getDependency(edge)!.targetId;
        if (internalSymbols.includes(target)) {
          internalLinks++;
        }
      }
    }

    return internalLinks / possibleLinks;
  }
}
