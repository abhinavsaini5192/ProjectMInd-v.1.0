export interface CouplingMetrics {
  symbolId: string;
  afferentCoupling: number; // Fan-in (Incoming dependencies)
  efferentCoupling: number; // Fan-out (Outgoing dependencies)
  instability: number; // Ce / (Ca + Ce). 0 = totally stable, 1 = totally unstable
  abstractness: number; // (Abstract classes + Interfaces) / Total classes. We might mock this depending on symbol info available.
  distanceFromMainSequence: number; // | A + I - 1 |
  cohesionScore: number; // Internal connections vs external
}

export interface DependencyStatistics {
  averageChainLength: number;
  maximumChainLength: number;
  dependencyDepth: number;
  dependencyBreadth: number;
  centralityScore: number; // Betweenness centrality mock or rank
  changeImpactScore: number; // How many downstream symbols are affected
}
