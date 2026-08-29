import { describe, it, expect, beforeEach } from 'vitest';
import { AutonomousAgentLoop } from '../../../src/intelligence/orchestration/core/AutonomousAgentLoop';
import { ContextEngine } from '../../../src/intelligence/context/core/ContextEngine';
import { StructuredReasoningEngine } from '../../../src/intelligence/reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../../src/intelligence/planning/core/PlanningCoordinator';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';

describe('Closed-Loop Traceability (Phase 5.6)', () => {
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

    loop = new AutonomousAgentLoop(contextEngine, reasoningEngine, planningCoordinator);
  });

  it('should maintain comprehensive lineage linking taskId -> contextPackageId -> reasoningId -> decisionId -> planId -> executionId', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Fix trace test', type: 'OBSERVATION' }],
        evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'symbol_AuthService', claim: 'Meta fact', confidence: 0.9 }],
        conclusions: [{ statement: 'Execute fix', evidenceIds: ['ev_1'], confidence: 0.9 }],
        decision: {
          status: 'READY_FOR_EXECUTION',
          decisionType: 'MODIFY_CODE',
          targets: ['AuthService'],
          actions: ['Apply fix'],
          constraints: [],
          requiredVerification: ['Run tests'],
          summary: 'AuthService'
        },
        confidence: 0.9
      }
    });

    const outcome = await loop.runLoop('task_trace_closed_loop', 'Fix AuthService trace bug');

    expect(outcome.lineage.taskId).toBe('task_trace_closed_loop');
    expect(outcome.lineage.contextPackageId).toBeDefined();
    expect(outcome.lineage.reasoningId).toBeDefined();
    expect(outcome.lineage.decisionId).toBeDefined();
    expect(outcome.lineage.planId).toBeDefined();
    expect(outcome.lineage.executionId).toBeDefined();
  });
});
