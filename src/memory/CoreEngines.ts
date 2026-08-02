import { KnowledgeGraph } from '../intelligence/engines/KnowledgeGraphBuilder';
import { Fact } from '../extraction/models/Fact';

export class MemoryStore {
  private currentGraph: KnowledgeGraph;

  constructor(initialGraph?: KnowledgeGraph) {
    this.currentGraph = initialGraph || { facts: new Map(), semanticEvents: [], architecturalEvents: [] };
  }

  public getGraph(): KnowledgeGraph {
    return this.currentGraph;
  }
}

export class ConflictResolutionEngine {
  /**
   * Identifies and resolves conflicts during an incremental merge.
   */
  public resolveConflicts(existingGraph: KnowledgeGraph, incomingGraph: KnowledgeGraph): KnowledgeGraph {
    // Strategy: Last Write Wins with Warning.
    // For MVP, we simply overwrite existing facts with incoming facts if IDs match.
    // In a mature system, this would flag conflicts if versions clash.
    const resolvedGraph: KnowledgeGraph = {
      facts: new Map(existingGraph.facts),
      semanticEvents: [...existingGraph.semanticEvents],
      architecturalEvents: [...existingGraph.architecturalEvents]
    };
    return resolvedGraph;
  }
}

export class IncrementalMergeEngine {
  private conflictResolver: ConflictResolutionEngine;

  constructor() {
    this.conflictResolver = new ConflictResolutionEngine();
  }

  /**
   * Merges incoming AI semantic graphs into the persistent MemoryStore cleanly.
   */
  public merge(store: MemoryStore, incomingGraph: KnowledgeGraph): void {
    const existing = store.getGraph();
    const resolved = this.conflictResolver.resolveConflicts(existing, incomingGraph);
    
    // Apply resolved incoming facts
    for (const [id, fact] of incomingGraph.facts.entries()) {
      resolved.facts.set(id, fact);
    }
    
    // Append events safely
    resolved.semanticEvents.push(...incomingGraph.semanticEvents);
    resolved.architecturalEvents.push(...incomingGraph.architecturalEvents);

    // Swap reference
    store['currentGraph'] = resolved;
  }
}
