import { ContextPack, ContextMode, ContextWarning } from '../models/ContextPack';
import { ContextGraph } from '../models/ContextGraph';
import { Decision } from '../../decision/models/Decision';
import { TokenCostEstimator } from '../analyzers/TokenCostEstimator';
import crypto from 'crypto';

export class ContextPackBuilder {
  constructor(private estimator: TokenCostEstimator) {}

  public build(graph: ContextGraph, decision: Decision, warnings: ContextWarning[], mode: ContextMode): ContextPack {
     const pack: ContextPack = {
       packId: crypto.randomUUID(),
       task: decision.intent.type,
       mode,
       sections: {
         required: graph.nodes.filter(n => n.data.relevance >= 0.9),
         useful: graph.nodes.filter(n => n.data.relevance >= 0.5 && n.data.relevance < 0.9),
         optional: graph.nodes.filter(n => n.data.relevance < 0.5)
       },
       excludedContext: decision.excludedContext.map(c => c.entityId),
       estimatedTokenCost: graph.nodes.reduce((sum, n) => sum + this.estimator.estimate(n), 0),
       confidence: decision.confidence,
       warnings,
       sources: ['ContextIntelligenceEngine']
     };

     return pack;
  }
}
