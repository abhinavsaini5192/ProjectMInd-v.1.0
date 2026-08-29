import { SLMTaskType } from '../../slm/models/SLMTaskType';

export class TaskWeightingPolicy {
  public getWeights(taskType: SLMTaskType): { deterministicWeight: number, slmWeight: number } {
    switch(taskType) {
      case SLMTaskType.FEATURE_INTERPRETATION:
        return { deterministicWeight: 0.4, slmWeight: 0.6 }; // SLM is good at semantic mapping
      case SLMTaskType.CONTEXT_RANKING:
        return { deterministicWeight: 0.6, slmWeight: 0.4 };
      case SLMTaskType.AMBIGUITY_RESOLUTION:
        return { deterministicWeight: 0.5, slmWeight: 0.5 };
      case SLMTaskType.SEMANTIC_SIMILARITY:
        return { deterministicWeight: 0.3, slmWeight: 0.7 };
      case SLMTaskType.REASONING_SUMMARY:
        return { deterministicWeight: 0.1, slmWeight: 0.9 };
      default:
        return { deterministicWeight: 1.0, slmWeight: 0.0 }; // Default safe fallback
    }
  }

  public getSecurityWeights(): { deterministicWeight: number, slmWeight: number } {
    // Hard boundary
    return { deterministicWeight: 1.0, slmWeight: 0.0 };
  }
}
