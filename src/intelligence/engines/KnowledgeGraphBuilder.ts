import { SemanticEvent, ArchitecturalEvent } from '../models/SemanticModels';
import { Fact } from '../../extraction/models/Fact';

export interface KnowledgeGraph {
  facts: Map<string, Fact>;
  semanticEvents: SemanticEvent[];
  architecturalEvents: ArchitecturalEvent[];
}

/**
 * Merges semantic events and deterministic facts into a queryable knowledge graph.
 * This runs locally and deterministically; no AI inference needed here.
 */
export class KnowledgeGraphBuilder {
  private graph: KnowledgeGraph;

  constructor(initialGraph?: KnowledgeGraph) {
    this.graph = initialGraph || {
      facts: new Map(),
      semanticEvents: [],
      architecturalEvents: []
    };
  }

  /**
   * Incrementally updates the graph.
   */
  public updateKnowledgeGraph(newFacts: Fact[], semanticEvent?: SemanticEvent, archEvent?: ArchitecturalEvent): void {
    // 1. Merge deterministic facts (UPSERT based on ID)
    for (const fact of newFacts) {
      if (fact.type.includes('Removed') || fact.type.includes('Deleted')) {
        this.graph.facts.delete(fact.id);
      } else {
        this.graph.facts.set(fact.id, fact);
      }
    }

    // 2. Append semantic history
    if (semanticEvent) {
      this.graph.semanticEvents.push(semanticEvent);
    }
    
    // 3. Append architectural history
    if (archEvent) {
      this.graph.architecturalEvents.push(archEvent);
    }
  }

  public getGraph(): KnowledgeGraph {
    return this.graph;
  }
}
