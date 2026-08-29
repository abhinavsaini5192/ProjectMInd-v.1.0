import { ContextGraph, ContextGraphNode } from '../models/ContextGraph';
import { TokenCostEstimator } from '../analyzers/TokenCostEstimator';

export class ContextCompressor {
  constructor(private estimator: TokenCostEstimator) {}

  public compress(nodes: ContextGraphNode[], maxTokens: number): ContextGraphNode[] {
    let currentTokens = nodes.reduce((sum, n) => sum + this.estimator.estimate(n), 0);
    
    if (currentTokens <= maxTokens) return nodes;

    // Sort by lowest relevance first to compress
    const sorted = [...nodes].sort((a, b) => a.data.relevance - b.data.relevance);

    for (const node of sorted) {
       if (currentTokens <= maxTokens) break;
       
       if (node.data.compression === 'FULL') {
          node.data.compression = 'SUMMARY';
          currentTokens -= (1000 - 100); // Mock savings
       } else if (node.data.compression === 'SUMMARY') {
          node.data.compression = 'METADATA';
          currentTokens -= (100 - 10);
       }
    }

    // If still over budget, we have to start dropping non-required entirely (handled by budget optimizer later, but compressor tries its best to keep semantics)
    return sorted.filter(n => this.estimator.estimate(n) > 0);
  }
}
