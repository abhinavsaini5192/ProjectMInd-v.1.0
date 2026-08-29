import { describe, it, expect } from 'vitest';
import { PlanningCoordinator } from '../../../src/intelligence/planning/core/PlanningCoordinator';
import { ReasoningResult } from '../../../src/intelligence/reasoning/models/ReasoningResult';

describe('Planning Traceability (Phase 5.5)', () => {
  const coordinator = new PlanningCoordinator();

  it('should preserve full end-to-end lineage: taskId -> contextPackageId -> reasoningId -> decisionId -> planId', () => {
    const reasoning: ReasoningResult = {
      reasoningId: 'rsn_trace_999',
      taskId: 'task_trace_123',
      modelId: 'mock-model',
      contextPackageId: 'pkg_trace_456',
      promptVersion: '1.0',
      observations: [],
      evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'src_auth', claim: 'Auth valid', confidence: 0.9 }],
      hypotheses: [],
      conclusions: [{ statement: 'Fix timeout in AuthService', evidenceIds: ['ev_1'], confidence: 0.9 }],
      assumptions: [],
      alternatives: [],
      uncertainty: [],
      recommendations: [],
      decision: {
        status: 'READY_FOR_EXECUTION',
        decisionType: 'MODIFY_CODE',
        targets: ['AuthService'],
        actions: ['Update timeout'],
        constraints: [],
        requiredVerification: [],
        summary: 'AuthService'
      },
      confidence: 0.9,
      validationStatus: 'VALID',
      schemaVersion: '1.0',
      strategyVersion: '1.0',
      createdAt: Date.now()
    };

    const outcome = coordinator.processReasoning(reasoning);

    expect(outcome.decision.taskId).toBe('task_trace_123');
    expect(outcome.decision.reasoningId).toBe('rsn_trace_999');
    expect(outcome.plan.taskId).toBe('task_trace_123');
    expect(outcome.plan.reasoningId).toBe('rsn_trace_999');
    expect(outcome.plan.decisionId).toBe(outcome.decision.decisionId);
    expect(outcome.plan.status).toBe('VALIDATED');
  });
});
