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

describe('Execution Gate & Approval Safeguards (Phase 5.6)', () => {
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

  it('should halt autonomous loop and enter AWAITING_APPROVAL when high-risk DELETE action is planned', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Delete table', type: 'OBSERVATION' }],
        evidence: [{ evidenceId: 'ev_1', type: 'PROJECT_OVERVIEW', sourceId: 'project_meta', claim: 'Legacy table', confidence: 0.9 }],
        conclusions: [{ statement: 'Delete table', evidenceIds: ['ev_1'], confidence: 0.9 }],
        decision: {
          status: 'READY_FOR_EXECUTION',
          decisionType: 'DELETE',
          targets: ['src/index.ts'],
          actions: ['Delete table'],
          constraints: [],
          requiredVerification: [],
          summary: 'Delete user database table'
        },
        confidence: 0.9
      }
    });

    const outcome = await loop.runLoop('task_gate_1', 'Delete user database table');

    expect(outcome.status).toBe(LoopStatus.AWAITING_APPROVAL);
    expect(outcome.approvalRequired).toBe(true);
    expect(outcome.verificationPassed).toBe(false);
    expect(outcome.changesApplied.length).toBe(0); // Execution was halted before applying changes!
  });
});
