import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { PropagationResult } from '../interfaces/IImpactPropagator.js';
import { FeatureImpactPropagator } from '../propagation/FeatureImpactPropagator.js';
import { ResourceImpactPropagator } from '../propagation/ResourceImpactPropagator.js';

export class ImpactPropagationEngine {
  private featurePropagator: FeatureImpactPropagator;
  private resourcePropagator: ResourceImpactPropagator;

  constructor(featurePropagator?: FeatureImpactPropagator, resourcePropagator?: ResourceImpactPropagator) {
    this.featurePropagator = featurePropagator || new FeatureImpactPropagator();
    this.resourcePropagator = resourcePropagator || new ResourceImpactPropagator();
  }

  public async propagate(
    initialCandidates: ImpactCandidate[],
    context: ImpactContext
  ): Promise<PropagationResult> {
    const maxDepth = context.options.maxDepth ?? context.config.maxPropagationDepth ?? 5;

    // 1. Propagate resource impacts
    const resResult = await this.resourcePropagator.propagate(initialCandidates, context, { maxDepth });

    // 2. Propagate feature impacts
    const featResult = await this.featurePropagator.propagate(initialCandidates, context, { maxDepth });

    const allPropagatedCandidates: ImpactCandidate[] = [
      ...resResult.propagatedCandidates,
      ...featResult.propagatedCandidates,
    ];

    const allPaths: ImpactPath[] = [
      ...resResult.generatedPaths,
      ...featResult.generatedPaths,
    ];

    return {
      propagatedCandidates: allPropagatedCandidates,
      generatedPaths: allPaths,
      maxDepthReached: Math.max(resResult.maxDepthReached, featResult.maxDepthReached),
      cyclesDetected: [...resResult.cyclesDetected, ...featResult.cyclesDetected],
      skippedNodes: resResult.skippedNodes + featResult.skippedNodes,
    };
  }
}
