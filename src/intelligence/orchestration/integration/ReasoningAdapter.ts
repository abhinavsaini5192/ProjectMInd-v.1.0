import { StructuredReasoningEngine } from '../../reasoning/core/StructuredReasoningEngine';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ReasoningTaskType } from '../../reasoning/models/ReasoningTask';
import { ContextPackage } from '../../context/models/ContextPackage';

export class ReasoningAdapter {
  constructor(private reasoningEngine: StructuredReasoningEngine) {}

  public async executeReasoning(
    taskId: string,
    objective: string,
    contextPackage: ContextPackage
  ): Promise<ReasoningResult> {
    return this.reasoningEngine.reason({
      taskId,
      type: ReasoningTaskType.BUG_ANALYSIS,
      objective,
      contextPackage
    });
  }
}
