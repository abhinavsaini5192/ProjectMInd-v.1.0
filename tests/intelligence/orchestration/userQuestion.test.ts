import { describe, it, expect, beforeEach } from 'vitest';
import { TaskOrchestrator } from '../../../src/intelligence/orchestration/core/TaskOrchestrator';
import { TaskLoop } from '../../../src/intelligence/orchestration/core/TaskLoop';
import { ContextAdapter } from '../../../src/intelligence/orchestration/integration/ContextAdapter';
import { ReasoningAdapter } from '../../../src/intelligence/orchestration/integration/ReasoningAdapter';
import { PlanningAdapter } from '../../../src/intelligence/orchestration/integration/PlanningAdapter';
import { ExecutionAdapter } from '../../../src/intelligence/orchestration/integration/ExecutionAdapter';
import { FeedbackAdapter } from '../../../src/intelligence/orchestration/integration/FeedbackAdapter';
import { ContextEngine } from '../../../src/intelligence/context/core/ContextEngine';
import { StructuredReasoningEngine } from '../../../src/intelligence/reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../../src/intelligence/planning/core/PlanningCoordinator';
import { FeedbackEngine } from '../../../src/intelligence/feedback/core/FeedbackEngine';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { TaskState } from '../../../src/intelligence/orchestration/models/TaskState';

describe('Orchestration: User Question Flow & Clarifications', () => {
  let orchestrator: TaskOrchestrator;
  let mockProvider: MockSLMProvider;

  beforeEach(async () => {
    const registry = new ModelRegistry();
    mockProvider = new MockSLMProvider();
    const models = await mockProvider.listModels();
    for (const m of models) registry.registerModel(m);

    const selector = new ModelSelector(registry);
    const inferenceManager = new InferenceManager({
      provider: 'mock',
      model: 'mock-model',
      endpoint: '',
      temperature: 0.1,
      contextWindow: 8192,
      maxOutputTokens: 1000,
      timeout: 1000
    });
    inferenceManager.registerProvider('mock', mockProvider);

    const contextEngine = new ContextEngine();
    const reasoningEngine = new StructuredReasoningEngine(selector, inferenceManager);
    const planningCoordinator = new PlanningCoordinator();
    const feedbackEngine = new FeedbackEngine();

    const loop = new TaskLoop(
      new ContextAdapter(contextEngine),
      new ReasoningAdapter(reasoningEngine),
      new PlanningAdapter(planningCoordinator),
      new ExecutionAdapter(),
      new FeedbackAdapter(feedbackEngine)
    );

    orchestrator = new TaskOrchestrator(loop);
  });

  it('should pause in WAITING_FOR_USER when reasoning encounters ambiguous requirements', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Ambiguous design choices', type: 'OBSERVATION' }],
        evidence: [{ evidenceId: 'ev_1', type: 'ARCHITECTURE', sourceId: 'arch_core', claim: 'Multiple options', confidence: 0.5 }],
        conclusions: [{ statement: 'Clarification required', evidenceIds: ['ev_1'], confidence: 0.5 }],
        uncertainties: ['Should auth remain centralized or move to service modules?'],
        decision: {
          status: 'NEEDS_MORE_INFORMATION',
          decisionType: 'GATHER_INFORMATION',
          targets: [],
          actions: [],
          constraints: [],
          requiredVerification: [],
          summary: 'Clarification required'
        },
        confidence: 0.5
      }
    });

    const outcome = await orchestrator.runTask('task_question_1', 'Change AuthService architecture');
    expect(outcome.status).toBe(TaskState.WAITING_FOR_USER);
    expect(outcome.goalAchieved).toBe(false);
  });
});
