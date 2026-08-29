import { DependencyRegistry } from './DependencyRegistry';
import { DependencyGraphBuilder } from './DependencyGraphBuilder';
import { DependencyStatistics } from '../models/CouplingMetrics';
import { IDependency } from '../models/Dependency';

export class DependencyMetrics {
  constructor(
    private registry: DependencyRegistry,
    private builder: DependencyGraphBuilder
  ) {}

  public calculateGlobalStats(): DependencyStatistics {
    const allDeps = this.registry.getAllDependencies();
    
    let totalLength = 0;
    let maxLength = 0;
    let computedChains = 0;

    // A very expensive global metric. We just calculate raw edges for L2.5 scope
    // Realistic implementation uses graph-theoretic libraries for PageRank / Centrality
    for (const dep of allDeps) {
      const chain = this.builder.buildChain(dep.sourceId, allDeps, (id) => this.registry.getOutEdges(id).map(edgeId => this.registry.getDependency(edgeId)!));
      
      totalLength += chain.maxLength;
      if (chain.maxLength > maxLength) maxLength = chain.maxLength;
      computedChains++;
    }

    return {
      averageChainLength: computedChains > 0 ? (totalLength / computedChains) : 0,
      maximumChainLength: maxLength,
      dependencyDepth: maxLength,
      dependencyBreadth: this.registry.getAllDependencies().length,
      centralityScore: 0, // Mock
      changeImpactScore: 0 // Mock
    };
  }
}
