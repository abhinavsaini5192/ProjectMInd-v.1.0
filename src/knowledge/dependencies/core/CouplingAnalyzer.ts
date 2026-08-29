import { DependencyRegistry } from './DependencyRegistry';
import { CouplingMetrics } from '../models/CouplingMetrics';

export class CouplingAnalyzer {
  constructor(private registry: DependencyRegistry) {}

  public calculateMetrics(symbolId: string): CouplingMetrics {
    const afferent = this.registry.getInEdges(symbolId).length; // Fan-in
    const efferent = this.registry.getOutEdges(symbolId).length; // Fan-out
    
    // Instability = Ce / (Ca + Ce)
    const totalCoupling = afferent + efferent;
    const instability = totalCoupling === 0 ? 0 : (efferent / totalCoupling);

    return {
      symbolId,
      afferentCoupling: afferent,
      efferentCoupling: efferent,
      instability,
      abstractness: 0, // Needs symbol metadata for interface vs class
      distanceFromMainSequence: 0,
      cohesionScore: 0 // Stub for cohesion
    };
  }
}
