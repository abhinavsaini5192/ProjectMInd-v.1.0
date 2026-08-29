import { ContextGraph } from '../models/ContextGraph';
import { Decision } from '../../decision/models/Decision';

export class ContextGraphBuilder {
  constructor(private knowledgeGateway: any) {}

  public build(decision: Decision): ContextGraph {
    const graph: ContextGraph = { nodes: [], edges: [] };
    
    // Convert L3.1 Decision required context into graph nodes
    for (const ctx of decision.requiredContext) {
      graph.nodes.push({
        id: ctx.entityId,
        type: ctx.type === 'feature' ? 'FEATURE' : 'SYMBOL', // rough mapping
        data: { relevance: ctx.relevanceScore, compression: 'FULL' }
      });
    }

    for (const ctx of decision.recommendedContext) {
      graph.nodes.push({
        id: ctx.entityId,
        type: ctx.type === 'feature' ? 'FEATURE' : 'SYMBOL', 
        data: { relevance: ctx.relevanceScore, compression: 'FULL' }
      });
    }

    return graph;
  }
}
