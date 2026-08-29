import { describe, it, expect, beforeEach } from 'vitest';
import { BrainEngine } from '../../../src/agent/brain/core/BrainEngine';
import { SLMManager } from '../../../src/intelligence/slm/core/SLMManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { DecisionType } from '../../../src/agent/brain/models/BrainDecision';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { ContextBudgetManager } from '../../../src/agent/brain/context/ContextBudgetManager';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelDiscovery } from '../../../src/intelligence/slm/discovery/ModelDiscovery';

describe('Brain Foundation & Intelligence Orchestration (Phase 4.10 / 5.2)', () => {
  let engine: BrainEngine;
  let mockProvider: MockSLMProvider;
  let registry: ModelRegistry;
  let discovery: ModelDiscovery;
  let inferenceManager: InferenceManager;
  let modelSelector: ModelSelector;

  beforeEach(async () => {
    // Setup 5.2 dependencies
    registry = new ModelRegistry();
    discovery = new ModelDiscovery(registry);
    
    mockProvider = new MockSLMProvider();
    discovery.registerProvider('mock', mockProvider);
    await discovery.refresh();

    modelSelector = new ModelSelector(registry);
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

    engine = new BrainEngine(inferenceManager, modelSelector, new KernelEventDispatcher());
  });

  it('should successfully orchestrate a full brain session and return a valid MODIFY_CODE decision', async () => {
    const decision = await engine.processRequest('task_1', 'Fix authentication bug');
    
    expect(decision).toBeDefined();
    expect(decision.decisionType).toBe(DecisionType.MODIFY_CODE);
    expect(decision.targets).toContain('src/index.ts'); // MockSLMProvider defaults to src/index.ts
  });

  it('should explicitly reject SLM decisions that target non-existent symbols (hallucinations)', async () => {
    mockProvider.setOverrideResponse({
       structuredOutput: {
          decisionType: DecisionType.MODIFY_CODE,
          confidence: 0.9,
          targets: ['src/auth/NonExistentService.ts']
       }
    });

    await expect(engine.processRequest('task_2', 'Hallucinate target')).rejects.toThrow('Target "src/auth/NonExistentService.ts" does not exist in repository graph');
  });

  it('should reject SLM decisions with low confidence (< 0.5) if not requesting information', async () => {
    mockProvider.setOverrideResponse({
       structuredOutput: {
          decisionType: DecisionType.MODIFY_CODE,
          confidence: 0.4,
          targets: ['src/index.ts']
       }
    });

    await expect(engine.processRequest('task_3', 'Low confidence code edit')).rejects.toThrow('Invalid Brain Decision: Confidence too low for autonomous action');
  });

  it('should accept low confidence ONLY if decision is REQUEST_INFORMATION', async () => {
    mockProvider.setOverrideResponse({
       structuredOutput: {
          decisionType: DecisionType.REQUEST_INFORMATION,
          confidence: 0.1,
          reasoningSummary: 'I do not know how to proceed.'
       }
    });

    const decision = await engine.processRequest('task_4', 'Ambiguous task');
    expect(decision.decisionType).toBe(DecisionType.REQUEST_INFORMATION);
  });

  it('ContextBudgetManager should truncate context nodes exceeding maximum token limit', () => {
    const budgetManager = new ContextBudgetManager();
    // Simulate a massive node that eats 4001 tokens roughly
    const massiveNode = { type: 'DUMP', content: 'A'.repeat(16000) }; 
    const tinyNode = { type: 'TASK', content: 'Small' };

    const truncated = budgetManager.truncate([tinyNode, massiveNode]);
    
    expect(truncated.length).toBe(1);
    expect(truncated[0].type).toBe('TASK');
  });
});
