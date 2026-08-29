import { ContextGraph } from '../models/ContextGraph';
import { ContextWarning } from '../models/ContextPack';

export class ContradictionDetector {
  public detect(graph: ContextGraph): ContextWarning[] {
    const warnings: ContextWarning[] = [];
    
    // Scan edges for explicit contradictions (e.g. injected during graph building by architectural rules)
    for (const edge of graph.edges) {
      if (edge.type === 'CONTRADICTS') {
         warnings.push({
           type: 'CONTRADICTION',
           message: `Detected contradiction between ${edge.sourceId} and ${edge.targetId}`,
           severity: 'ERROR'
         });
      }
    }
    return warnings;
  }
}
