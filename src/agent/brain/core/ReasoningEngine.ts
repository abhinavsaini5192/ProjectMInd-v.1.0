import { InferenceManager } from '../../../intelligence/slm/inference/InferenceManager';
import { ModelSelector } from '../../../intelligence/slm/selection/ModelSelector';
import { BrainDecision } from '../models/BrainDecision';
import { DecisionValidator } from './DecisionValidator';
import { StructuredReasoningEngine } from '../../../intelligence/reasoning/core/StructuredReasoningEngine';
import { ReasoningTask, ReasoningTaskType } from '../../../intelligence/reasoning/models/ReasoningTask';
import { ContextPackage } from '../../../intelligence/context/models/ContextPackage';

export class ReasoningEngine {
  private validator = new DecisionValidator();
  private structuredReasoningEngine: StructuredReasoningEngine;

  constructor(private inferenceManager: InferenceManager, private modelSelector: ModelSelector) {
    this.structuredReasoningEngine = new StructuredReasoningEngine(this.modelSelector, this.inferenceManager);
  }

  public async reason(taskId: string, intent: string, context: any): Promise<BrainDecision> {
    const contextPackage: ContextPackage = (context && typeof context === 'object' && 'packageId' in context)
      ? context as ContextPackage
      : {
          packageId: `cpkg_${Date.now()}`,
          planId: `cplan_${Date.now()}`,
          taskId: intent,
          summary: 'Direct context',
          items: [],
          sections: [],
          conflicts: [],
          tokenEstimate: 100,
          budget: {
            modelContextWindow: 8192,
            systemPromptReservation: 1000,
            taskPromptReservation: 500,
            outputReservation: 2048,
            safetyMargin: 200,
            availableContextBudget: 4444
          },
          generatedAt: Date.now()
        };

    const taskType = this.mapIntentToReasoningTaskType(intent);
    const reasoningTask: ReasoningTask = {
      taskId,
      type: taskType,
      objective: intent,
      contextPackage
    };

    const reasoningResult = await this.structuredReasoningEngine.reason(reasoningTask);

    const decision: BrainDecision = {
      decisionId: `dec_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      decisionType: (reasoningResult.decision.decisionType || 'MODIFY_CODE') as any,
      confidence: reasoningResult.confidence,
      reasoningSummary: reasoningResult.decision.summary || reasoningResult.conclusions[0]?.statement || '',
      targets: reasoningResult.decision.targets || [],
      actions: reasoningResult.decision.actions || [],
      constraints: reasoningResult.decision.constraints || [],
      requiredVerification: reasoningResult.decision.requiredVerification || [],
      evidence: reasoningResult.evidence.map(e => `${e.type}: ${e.claim} (${e.sourceId})`),
      createdAt: Date.now()
    };

    const validation = this.validator.validate(decision);
    if (!validation.valid) {
      throw new Error(`Invalid Brain Decision: ${validation.reason}`);
    }

    return decision;
  }

  private mapIntentToReasoningTaskType(intent: string): ReasoningTaskType {
    const lower = intent.toLowerCase();
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('timeout')) {
      return ReasoningTaskType.BUG_ANALYSIS;
    }
    if (lower.includes('review') || lower.includes('audit')) {
      return ReasoningTaskType.CODE_REVIEW;
    }
    if (lower.includes('arch') || lower.includes('design')) {
      return ReasoningTaskType.ARCHITECTURE_ANALYSIS;
    }
    return ReasoningTaskType.GENERAL_ANALYSIS;
  }
}


