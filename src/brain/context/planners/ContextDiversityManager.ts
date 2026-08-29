import { ContextGraph } from '../models/ContextGraph';

export class ContextDiversityManager {
  public ensureDiversity(graph: ContextGraph): void {
     // Penalize homogeneous context (e.g. 50 symbols from the exact same file)
     // For MVP, we mock this by just artificially bumping the relevance of non-SYMBOL nodes
     for (const node of graph.nodes) {
       if (node.type !== 'SYMBOL') {
          node.data.relevance = Math.min(1.0, (node.data.relevance || 0.5) + 0.1);
       }
     }
  }
}
