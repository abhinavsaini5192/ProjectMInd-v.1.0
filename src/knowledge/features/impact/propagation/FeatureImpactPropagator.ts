import type { IImpactPropagator, PropagationOptions, PropagationResult } from '../interfaces/IImpactPropagator.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import { DependencyImpactPropagator } from './DependencyImpactPropagator.js';
import { BehaviorImpactPropagator } from './BehaviorImpactPropagator.js';

export class FeatureImpactPropagator implements IImpactPropagator {
  public readonly name = 'FeatureImpactPropagator';

  private dependencyPropagator: DependencyImpactPropagator;
  private behaviorPropagator: BehaviorImpactPropagator;

  constructor(dependencyPropagator?: DependencyImpactPropagator, behaviorPropagator?: BehaviorImpactPropagator) {
    this.dependencyPropagator = dependencyPropagator || new DependencyImpactPropagator();
    this.behaviorPropagator = behaviorPropagator || new BehaviorImpactPropagator();
  }

  public async propagate(
    candidates: ImpactCandidate[],
    context: ImpactContext,
    options?: PropagationOptions
  ): Promise<PropagationResult> {
    const depResult = await this.dependencyPropagator.propagate(candidates, context, options);
    const behResult = await this.behaviorPropagator.propagate(candidates, context, options);

    const mergedCandidates: ImpactCandidate[] = [
      ...depResult.propagatedCandidates,
      ...behResult.propagatedCandidates,
    ];

    const mergedPaths: ImpactPath[] = [
      ...depResult.generatedPaths,
      ...behResult.generatedPaths,
    ];

    return {
      propagatedCandidates: mergedCandidates,
      generatedPaths: mergedPaths,
      maxDepthReached: Math.max(depResult.maxDepthReached, behResult.maxDepthReached),
      cyclesDetected: [...depResult.cyclesDetected, ...behResult.cyclesDetected],
      skippedNodes: depResult.skippedNodes + behResult.skippedNodes,
    };
  }
}
