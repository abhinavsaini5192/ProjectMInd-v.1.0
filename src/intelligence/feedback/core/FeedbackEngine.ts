import { ExecutionObservation } from '../models/ExecutionObservation';
import { ActionPlan } from '../../planning/models/ActionPlan';
import { FeedbackResult } from '../models/FeedbackResult';
import { ExecutionResult } from '../../../agent/execution/models/ExecutionResult';
import { ExecutionObserver } from './ExecutionObserver';
import { ChangeAnalyzer } from './ChangeAnalyzer';
import { OutcomeAnalyzer } from './OutcomeAnalyzer';
import { LearningCoordinator } from './LearningCoordinator';
import { MemoryFeedbackAdapter } from '../integration/MemoryFeedbackAdapter';
import { KnowledgeFeedbackAdapter } from '../integration/KnowledgeFeedbackAdapter';
import { ContextFeedbackAdapter } from '../integration/ContextFeedbackAdapter';
import { BrainFeedbackAdapter, BrainFeedbackPayload } from '../integration/BrainFeedbackAdapter';

export class FeedbackEngine {
  private observer = new ExecutionObserver();
  private changeAnalyzer = new ChangeAnalyzer();
  private outcomeAnalyzer = new OutcomeAnalyzer();
  private learningCoordinator = new LearningCoordinator();

  private memoryAdapter = new MemoryFeedbackAdapter();
  private knowledgeAdapter = new KnowledgeFeedbackAdapter();
  private contextAdapter = new ContextFeedbackAdapter();
  private brainAdapter = new BrainFeedbackAdapter();

  private processedExecutionIds = new Set<string>();
  private existingLearnings: any[] = [];

  public async processFeedback(
    execution: Partial<ExecutionResult>,
    plan: ActionPlan,
    dryRun: boolean = false
  ): Promise<{ result: FeedbackResult; brainFeedback: BrainFeedbackPayload }> {
    const executionId = execution.executionId || `exec_${Date.now()}`;
    const feedbackId = `fb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Idempotency Guard
    if (this.processedExecutionIds.has(executionId) && !dryRun) {
      // Return cached summary without duplicate side effects
      const cachedOutcome = this.outcomeAnalyzer.analyzeOutcome(plan, this.observer.observe(execution, plan));
      const cachedChanges = this.changeAnalyzer.analyzeChanges(this.observer.observe(execution, plan));
      const emptyResult: FeedbackResult = {
        feedbackId: `${feedbackId}_cached`,
        executionId,
        outcome: cachedOutcome,
        changes: cachedChanges,
        learningCandidates: [],
        promotedLearning: [],
        rejectedLearning: [],
        unresolvedIssues: cachedOutcome.unresolvedIssues,
        knowledgeUpdates: [],
        memoryUpdates: [],
        contextInvalidations: [],
        confidence: 1.0,
        warnings: ['Duplicate ExecutionCompleted event ignored for idempotency'],
        errors: []
      };
      return {
        result: emptyResult,
        brainFeedback: this.brainAdapter.formatBrainFeedback(emptyResult)
      };
    }

    // 2. Observe execution
    const observation = this.observer.observe(execution, plan);

    // 3. Analyze changes
    const changes = this.changeAnalyzer.analyzeChanges(observation);

    // 4. Analyze outcome & evaluate goal
    const outcome = this.outcomeAnalyzer.analyzeOutcome(plan, observation);

    // 5. Curate learning candidates
    const learningCuration = this.learningCoordinator.curateLearning(
      plan.taskId,
      outcome,
      changes,
      this.existingLearnings
    );

    const knowledgeUpdates: Array<{ target: string; operation: string }> = [];
    const memoryUpdates: Array<{ memoryId?: string; content: string; type: string }> = [];
    const contextInvalidations: string[] = [];

    if (!dryRun) {
      this.processedExecutionIds.add(executionId);
      this.existingLearnings.push(...learningCuration.promoted);

      // 6. Apply Knowledge Graph Updates
      knowledgeUpdates.push(...this.knowledgeAdapter.applyUpdates(changes));

      // 7. Apply Memory Updates for Promoted Learnings
      for (const promoted of learningCuration.promoted) {
        const memRecord = await this.memoryAdapter.persistLearning(promoted);
        memoryUpdates.push(memRecord);
      }

      // 8. Determine Context Invalidations
      contextInvalidations.push(...this.contextAdapter.determineInvalidations(changes));
    }

    const feedbackResult: FeedbackResult = {
      feedbackId,
      executionId,
      outcome,
      changes,
      learningCandidates: learningCuration.candidates,
      promotedLearning: learningCuration.promoted,
      rejectedLearning: learningCuration.rejected,
      unresolvedIssues: outcome.unresolvedIssues,
      knowledgeUpdates,
      memoryUpdates,
      contextInvalidations,
      confidence: outcome.goalEvaluation.confidence,
      warnings: observation.warnings,
      errors: observation.errors
    };

    const brainFeedback = this.brainAdapter.formatBrainFeedback(feedbackResult);

    return {
      result: feedbackResult,
      brainFeedback
    };
  }
}
