import { SemanticEvent } from '../models/SemanticEvent';
import { GraphTraversalEngine } from '../../graph/core/GraphTraversalEngine';

export class ImpactAnalyzer {
  constructor(private traversalEngine: GraphTraversalEngine) {}

  /**
   * For a given set of semantic events, calculates the downstream blast radius.
   * This is used to invalidate caches, trigger downstream rebuilds, or flag context regeneration.
   */
  public async analyzeImpact(events: SemanticEvent[]): Promise<string[]> {
    const blastRadius = new Set<string>();

    for (const event of events) {
      if (event.metadata.symbol) {
        // Find everything that depends on this symbol
        const dependents = await this.traversalEngine.getImpact(event.metadata.symbol);
        for (const d of dependents) {
          blastRadius.add(d.id || d);
        }
      }
      
      for (const file of event.impact) {
        // For file-level impacts
        const dependents = await this.traversalEngine.getImpact(file);
        for (const d of dependents) {
          blastRadius.add(d.id || d);
        }
      }
    }

    return Array.from(blastRadius);
  }
}
