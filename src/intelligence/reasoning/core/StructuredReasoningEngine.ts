import { ReasoningTask, ReasoningTaskType } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';
import { ReasoningSession } from './ReasoningSession';
import { ReasoningPipeline } from './ReasoningPipeline';
import { ReasoningStrategy } from '../strategies/ReasoningStrategy';
import { BugFixReasoning } from '../strategies/BugFixReasoning';
import { CodeReviewReasoning } from '../strategies/CodeReviewReasoning';
import { ArchitectureReasoning } from '../strategies/ArchitectureReasoning';
import { PlanningReasoning } from '../strategies/PlanningReasoning';
import { UnsupportedReasoningTaskError } from '../errors/UnsupportedReasoningTaskError';
import { ModelSelector } from '../../slm/selection/ModelSelector';
import { InferenceManager } from '../../slm/inference/InferenceManager';
import { ModelRequirements } from '../../slm/models/ModelRequirements';

export class StructuredReasoningEngine {
  private strategies: ReasoningStrategy[] = [
    new BugFixReasoning(),
    new CodeReviewReasoning(),
    new ArchitectureReasoning(),
    new PlanningReasoning()
  ];

  private pipeline: ReasoningPipeline;
  private activeSessions: Map<string, ReasoningSession> = new Map();

  constructor(
    private modelSelector: ModelSelector,
    private inferenceManager: InferenceManager
  ) {
    this.pipeline = new ReasoningPipeline(this.inferenceManager);
  }

  public registerStrategy(strategy: ReasoningStrategy): void {
    this.strategies.unshift(strategy);
  }

  public async reason(task: ReasoningTask): Promise<ReasoningResult> {
    const sessionId = `rsess_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const session: ReasoningSession = {
      reasoningSessionId: sessionId,
      taskId: task.taskId,
      modelId: 'undetermined',
      contextPackageId: task.contextPackage.packageId,
      startedAt: Date.now(),
      status: 'STARTED',
      retryCount: 0
    };
    this.activeSessions.set(sessionId, session);

    try {
      // 1. Select appropriate strategy
      const strategy = this.strategies.find(s => s.supports(task.type));
      if (!strategy) {
        throw new UnsupportedReasoningTaskError(task.type);
      }

      // 2. Select compatible SLM model
      const requirements: ModelRequirements = {
        taskType: task.type,
        requiresStructuredOutput: true,
        minimumContextWindow: Math.max(4000, task.contextPackage.tokenEstimate + 500)
      };
      const modelSelection = this.modelSelector.selectModel(requirements);
      session.modelId = modelSelection.selectedModel.modelId;

      // 3. Execute reasoning pipeline
      const result = await this.pipeline.execute(task, strategy, modelSelection);

      session.status = 'COMPLETED';
      session.completedAt = Date.now();
      session.latencyMs = session.completedAt - session.startedAt;
      session.validationStatus = result.validationStatus;

      return result;
    } catch (err: any) {
      session.status = 'FAILED';
      session.completedAt = Date.now();
      session.latencyMs = session.completedAt - session.startedAt;
      session.error = err;
      throw err;
    }
  }

  public getSession(sessionId: string): ReasoningSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}
