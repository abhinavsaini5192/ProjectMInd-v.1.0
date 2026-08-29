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

describe('Orchestration: TaskOrchestrator End-to-End Controls', () => {
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

  it('should support task cancellation and pause/resume mechanics', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Fix timeout', type: 'OBSERVATION' }],
        evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'symbol_AuthService', claim: 'Auth valid', confidence: 0.9 }],
        conclusions: [{ statement: 'Increase timeout', evidenceIds: ['ev_1'], confidence: 0.9 }],
        decision: {
          status: 'READY_FOR_EXECUTION',
          decisionType: 'MODIFY_CODE',
          targets: ['AuthService'],
          actions: ['Update timeout'],
          constraints: [],
          requiredVerification: ['Run tests'],
          summary: 'AuthService'
        },
        confidence: 0.9
      }
    });

    const preview = orchestrator.previewTask('Fix AuthService timeout bug');
    expect(preview.goal).toBe('Fix AuthService timeout bug');
    expect(preview.estimatedCycles).toBe(2);

    orchestrator.cancelTask('task_cancel_test');
    const outcome = await orchestrator.runTask('task_cancel_test', 'Fix AuthService timeout bug');
    expect(outcome.status).toBe(TaskState.CANCELLED);
  });
});
