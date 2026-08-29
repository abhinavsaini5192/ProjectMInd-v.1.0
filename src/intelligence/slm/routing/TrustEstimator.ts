import { SLMTaskType } from '../models/SLMTaskType';

export class TrustEstimator {
  private trustScores: Map<SLMTaskType, number> = new Map();

  constructor() {
    // Default pessimistic trust scores
    this.trustScores.set(SLMTaskType.FEATURE_INTERPRETATION, 0.5);
    this.trustScores.set(SLMTaskType.CONTEXT_RANKING, 0.5);
    this.trustScores.set(SLMTaskType.AMBIGUITY_RESOLUTION, 0.4);
    this.trustScores.set(SLMTaskType.SEMANTIC_SIMILARITY, 0.6);
    this.trustScores.set(SLMTaskType.REASONING_SUMMARY, 0.8); // High trust for summarization
  }

  public getTrustScore(task: SLMTaskType): number {
    return this.trustScores.get(task) || 0.1;
  }

  public updateTrust(task: SLMTaskType, precision: number, hallucinationRate: number): void {
    // Deterministic trust formula: Trust heavily penalizes hallucinations.
    const baseTrust = precision;
    const penalty = hallucinationRate * 2.0; // severe penalty
    
    let newTrust = Math.max(0, baseTrust - penalty);
    
    // Smooth moving average
    const oldTrust = this.getTrustScore(task);
    this.trustScores.set(task, (oldTrust * 0.7) + (newTrust * 0.3));
  }
}
