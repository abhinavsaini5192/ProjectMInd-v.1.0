import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomousAgentLoop } from '../../../src/intelligence/orchestration/core/AutonomousAgentLoop';
import { ContextEngine } from '../../../src/intelligence/context/core/ContextEngine';
import { StructuredReasoningEngine } from '../../../src/intelligence/reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../../src/intelligence/planning/core/PlanningCoordinator';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { LoopStatus } from '../../../src/intelligence/orchestration/models/LoopState';

describe('Iteration Budget & Termination (Phase 5.6)', () => {
  let loop: AutonomousAgentLoop;
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

    loop = new AutonomousAgentLoop(contextEngine, reasoningEngine, planningCoordinator, {
      maxIterations: 2,
      timeoutMs: 10000,
      requireApprovalForHighRisk: true,
      autoRollbackOnFailure: true,
      enableMemoryLearning: true
    });
  });

  it('should terminate and fail gracefully if iterations exceed maximum budget without succeeding', async () => {
    // In this mock, the plan is invalid/needs more information repeatedly
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [],
        evidence: [{ evidenceId: 'ev_1', type: 'PROJECT_OVERVIEW', sourceId: 'project_meta', claim: 'Claim', confidence: 0.3 }],
        conclusions: [{ statement: 'Ambiguous', evidenceIds: ['ev_1'], confidence: 0.3 }],
        decision: {
          status: 'NEEDS_MORE_INFORMATION',
          decisionType: 'NOOP',
          targets: ['src/index.ts'],
          actions: [],
          constraints: [],
          requiredVerification: [],
          summary: 'Ambiguous request'
        },
        confidence: 0.3
      }
    });

    const outcome = await loop.runLoop('task_budget_1', 'Ambiguous task');
    expect(outcome.iterations.length).toBeLessThanOrEqual(2);
  });
});
