export class StructuralRelevance {
  public calculate(resourceId: string, targetSymbols: string[], graphRelations: Map<string, string[]>): number {
    if (targetSymbols.includes(resourceId)) return 1.0;
    
    // Check if directly connected in structural relations (parent/child/module)
    for (const target of targetSymbols) {
      const related = graphRelations.get(target) || [];
      if (related.includes(resourceId)) return 0.85;
    }

    return 0.2;
  }
}
