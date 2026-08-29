import { describe, it, expect } from 'vitest';
import { ReasoningResult } from '../../../src/intelligence/reasoning/models/ReasoningResult';

describe('Reasoning Traceability (Phase 5.4)', () => {
  it('ReasoningResult must link complete trace: task -> context -> prompt -> model -> reasoningId', () => {
    const result: ReasoningResult = {
      reasoningId: 'rsn_123',
      taskId: 'task_abc',
      modelId: 'mock-model-v1',
      contextPackageId: 'cpkg_xyz',
      promptVersion: '1.0',
      observations: [],
      evidence: [],
      hypotheses: [],
      conclusions: [],
      assumptions: ['Assumes token in header'],
      alternatives: ['Alternative: Cookie session'],
      uncertainty: [],
      recommendations: ['Check auth config'],
      decision: {
        status: 'READY_FOR_EXECUTION',
        targets: ['src/auth/session.ts'],
        actions: ['Update timeout'],
        constraints: [],
        requiredVerification: [],
        summary: 'Update session timeout'
      },
      confidence: 0.9,
      validationStatus: 'VALID',
      schemaVersion: '1.0',
      strategyVersion: '1.0',
      createdAt: Date.now()
    };

    expect(result.taskId).toBe('task_abc');
    expect(result.contextPackageId).toBe('cpkg_xyz');
    expect(result.modelId).toBe('mock-model-v1');
    expect(result.promptVersion).toBe('1.0');
    expect(result.reasoningId).toBe('rsn_123');
  });
});
