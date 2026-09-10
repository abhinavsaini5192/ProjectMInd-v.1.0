import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactContext } from './IImpactSource.js';

export interface PropagationOptions {
  maxDepth?: number;
  visitedNodes?: Set<string>;
  visitedFeatures?: Set<string>;
}

export interface PropagationResult {
  propagatedCandidates: ImpactCandidate[];
  generatedPaths: ImpactPath[];
  maxDepthReached: number;
  cyclesDetected: Array<{ cycle: string[]; description: string }>;
  skippedNodes: number;
}

export interface IImpactPropagator {
  readonly name: string;
  propagate(
    candidates: ImpactCandidate[],
    context: ImpactContext,
    options?: PropagationOptions
  ): Promise<PropagationResult>;
}
