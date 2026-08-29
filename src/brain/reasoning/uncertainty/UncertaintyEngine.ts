import { ReasoningState } from '../models/ReasoningState';
import { UncertaintyType } from '../models/UncertaintyType';

export class UncertaintyEngine {
  public classify(state: ReasoningState): UncertaintyType[] {
    const types: UncertaintyType[] = [];

    if (state.confidence < 0.5) {
      types.push(UncertaintyType.INSUFFICIENT_EVIDENCE);
    }
    if (state.hypotheses.length > 1 && state.hypotheses.every(h => h.confidence > 0.4)) {
      types.push(UncertaintyType.MULTIPLE_VALID_PATHS);
    }
    if (state.task.toLowerCase().includes('ambiguous')) {
      types.push(UncertaintyType.TASK_AMBIGUITY);
    }

    if (types.length === 0) {
      types.push(UncertaintyType.NONE);
    }

    return types;
  }
}
