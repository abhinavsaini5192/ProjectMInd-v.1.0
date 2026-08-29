import { describe, it, expect, beforeEach } from 'vitest';
import { ReasoningEngine } from '../../../src/brain/reasoning/core/ReasoningEngine';
import { EvidenceEngine } from '../../../src/brain/reasoning/analyzers/EvidenceEngine';
import { HypothesisEngine } from '../../../src/brain/reasoning/analyzers/HypothesisEngine';
import { ConfidenceEngine } from '../../../src/brain/reasoning/analyzers/ConfidenceEngine';
import { ContradictionReasoner } from '../../../src/brain/reasoning/analyzers/ContradictionReasoner';
import { UncertaintyEngine } from '../../../src/brain/reasoning/uncertainty/UncertaintyEngine';
import { KnowledgeGapAnalyzer } from '../../../src/brain/reasoning/uncertainty/KnowledgeGapAnalyzer';
import { ClarificationEngine } from '../../../src/brain/reasoning/uncertainty/ClarificationEngine';
import { DecisionThresholdEngine } from '../../../src/brain/reasoning/policies/DecisionThresholdEngine';
import { ReasoningStateManager } from '../../../src/brain/reasoning/core/ReasoningStateManager';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { ContextPack, ContextMode } from '../../../src/brain/context/models/ContextPack';
import { UncertaintyType } from '../../../src/brain/reasoning/models/UncertaintyType';

describe('Reasoning & Uncertainty Engine (L3.3)', () => {
  let engine: ReasoningEngine;
  let stateManager: ReasoningStateManager;

  beforeEach(() => {
    stateManager = new ReasoningStateManager();
    engine = new ReasoningEngine(
      new EvidenceEngine(),
      new HypothesisEngine(),
      new ConfidenceEngine(),
      new ContradictionReasoner(),
      new UncertaintyEngine(),
      new KnowledgeGapAnalyzer(),
      new ClarificationEngine(),
      new DecisionThresholdEngine(),
      stateManager,
      new KernelEventDispatcher()
    );
  });

  const mockPack: ContextPack = {
    packId: 'pack_123',
    task: 'BUG_FIX',
    mode: ContextMode.STANDARD,
    sections: {
      required: [
        { id: 'feat_auth', type: 'FEATURE', data: {} }
      ],
      useful: [],
      optional: []
    },
    excludedContext: [],
    estimatedTokenCost: 100,
    confidence: 0.9,
    warnings: [],
    sources: []
  };

  it('should successfully reason through a high-confidence task', () => {
    // Explicit mention of auth matches the feature in the ContextPack
    const state = engine.process('Fix the auth bug', mockPack, 'repo_1', 'snap_1');

    expect(state.hypotheses.length).toBe(1);
    expect(state.confidence).toBeGreaterThan(0.5); // 0.1 base + 0.4 explicit + 0.3 matched = 0.8
    expect(state.decisionThreshold).toBe('MODERATE_CONFIDENCE');
    expect(state.clarificationRequest).toBeUndefined(); // No clarification needed
  });

  it('should detect ambiguity, spawn multiple hypotheses, and request clarification', () => {
    // Use the keyword "ambiguous" to trigger the mock HypothesisEngine logic
    const state = engine.process('Fix the ambiguous issue', mockPack, 'repo_1', 'snap_1');

    expect(state.hypotheses.length).toBe(2);
    expect(state.uncertaintyTypes).toContain(UncertaintyType.TASK_AMBIGUITY);
    expect(state.knowledgeGaps.length).toBe(1);
    
    // Low confidence spawns a clarification request
    expect(state.clarificationRequest).toBeDefined();
    expect(state.clarificationRequest?.valueScore).toBeGreaterThan(0);
  });

  it('should securely redact sensitive information from serialized state', () => {
    const sensitiveTask = 'Fix the bug with password processing';
    const state = engine.process(sensitiveTask, mockPack, 'repo_1', 'snap_1');

    const savedState = stateManager.get(state.stateId);
    expect(savedState?.task).toContain('[REDACTED]');
    expect(savedState?.task).not.toContain('password');
  });

  it('should mark states as stale when snapshot changes', () => {
    const state = engine.process('Fix the auth bug', mockPack, 'repo_1', 'snap_1');
    expect(stateManager.get(state.stateId)?.isStale).toBe(false);

    stateManager.invalidateStale('snap_2'); // New snapshot arrives
    expect(stateManager.get(state.stateId)?.isStale).toBe(true);
  });
});
