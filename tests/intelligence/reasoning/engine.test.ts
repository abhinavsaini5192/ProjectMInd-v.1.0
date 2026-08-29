import { describe, it, expect, beforeEach } from 'vitest';
import { StructuredReasoningEngine } from '../../../src/intelligence/reasoning/core/StructuredReasoningEngine';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { ReasoningTaskType } from '../../../src/intelligence/reasoning/models/ReasoningTask';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Structured Reasoning Engine End-to-End (Phase 5.4)', () => {
  let registry: ModelRegistry;
  let selector: ModelSelector;
  let inferenceManager: InferenceManager;
  let mockProvider: MockSLMProvider;
  let engine: StructuredReasoningEngine;

  const mockContextPackage = {
    packageId: 'pkg_test_1',
    planId: 'plan_test_1',
    taskId: 'Fix login timeout',
    summary: 'Context summary',
    items: [{
      id: 'sym_auth',
      type: ContextType.SYMBOL,
      content: 'AuthService handles login timeouts',
      sources: [{
        sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
        sourceId: 'src_auth_code',
        confidence: 1.0,
        timestamp: Date.now(),
        trustLevel: TrustLevel.VERIFIED_CODE_FACT
      }],
      relevance: 1.0,
      confidence: 1.0,
      priority: 1,
      tokenEstimate: 50,
      metadata: { entityName: 'AuthService' }
    }],
    sections: [],
    conflicts: [],
    tokenEstimate: 200,
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

  beforeEach(async () => {
    registry = new ModelRegistry();
    mockProvider = new MockSLMProvider();
    const models = await mockProvider.listModels();
    for (const m of models) {
      registry.registerModel(m);
    }

    selector = new ModelSelector(registry);
    inferenceManager = new InferenceManager({
      provider: 'mock',
      model: 'mock-model',
      endpoint: '',
      temperature: 0.1,
      contextWindow: 8192,
      maxOutputTokens: 1000,
      timeout: 1000
    });
    inferenceManager.registerProvider('mock', mockProvider);

    engine = new StructuredReasoningEngine(selector, inferenceManager);
  });

  it('should execute reasoning and return a validated ReasoningResult', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Login timeout observed in AuthService', type: 'OBSERVATION' }],
        evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'src_auth_code', claim: 'AuthService handles login timeouts', confidence: 0.9 }],
        conclusions: [{ statement: 'Session expiration duration is too short', evidenceIds: ['ev_1'], confidence: 0.85 }],
        decision: {
          status: 'READY_FOR_EXECUTION',
          decisionType: 'MODIFY_CODE',
          targets: ['src/index.ts'],
          actions: ['Update timeout constant'],
          constraints: [],
          requiredVerification: ['Run auth unit tests'],
          summary: 'Increase session timeout from 5s to 30s'
        },
        confidence: 0.85
      }
    });

    const result = await engine.reason({
      taskId: 'task_reason_1',
      type: ReasoningTaskType.BUG_ANALYSIS,
      objective: 'Fix login timeout',
      contextPackage: mockContextPackage as any
    });

    expect(result.reasoningId).toBeDefined();
    expect(result.validationStatus).toBe('VALID');
    expect(result.conclusions.length).toBe(1);
    expect(result.decision.status).toBe('READY_FOR_EXECUTION');
    expect(result.confidence).toBe(0.85);
  });

  it('should reject reasoning with fabricated evidence', async () => {
    mockProvider.setOverrideResponse({
      structuredOutput: {
        evidence: [{ evidenceId: 'ev_fake', type: 'SYMBOL', sourceId: 'fabricated_non_existent_source_999', claim: 'Fake fact', confidence: 0.9 }],
        conclusions: [{ statement: 'Fake conclusion', evidenceIds: ['ev_fake'], confidence: 0.9 }],
        decision: { status: 'READY_FOR_EXECUTION', targets: ['src/index.ts'], actions: [], constraints: [], requiredVerification: [], summary: 'Fake' },
        confidence: 0.9
      }
    });

    await expect(engine.reason({
      taskId: 'task_reason_2',
      type: ReasoningTaskType.BUG_ANALYSIS,
      objective: 'Fix bug with fabricated claim',
      contextPackage: mockContextPackage as any
    })).rejects.toThrow('Fabricated or ungrounded evidence');
  });
});
