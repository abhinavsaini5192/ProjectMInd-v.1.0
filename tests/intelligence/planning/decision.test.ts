import { describe, it, expect } from 'vitest';
import { DecisionEngine } from '../../../src/intelligence/planning/core/DecisionEngine';
import { ReasoningResult } from '../../../src/intelligence/reasoning/models/ReasoningResult';

describe('Decision Engine (Phase 5.5)', () => {
  const engine = new DecisionEngine();

  const sampleReasoning: ReasoningResult = {
    reasoningId: 'rsn_123',
    taskId: 'task_auth_fix',
    modelId: 'mock-model',
    contextPackageId: 'pkg_123',
    promptVersion: '1.0',
    observations: [{ stepNumber: 1, type: 'OBSERVATION', statement: 'Session timeout too low' }],
    evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'src_auth', claim: 'AuthService timeout is 5s', confidence: 0.9 }],
    hypotheses: [],
    conclusions: [{ statement: 'Increase session timeout to 30s', evidenceIds: ['ev_1'], confidence: 0.9 }],
    assumptions: [],
    alternatives: [],
    uncertainty: [],
    recommendations: ['Update config'],
    decision: {
      status: 'READY_FOR_EXECUTION',
      decisionType: 'MODIFY_CODE',
      targets: ['src/auth/session.ts'],
      actions: ['Increase timeout'],
      constraints: [],
      requiredVerification: [],
      summary: 'Increase session timeout'
    },
    confidence: 0.9,
    validationStatus: 'VALID',
    schemaVersion: '1.0',
    strategyVersion: '1.0',
    createdAt: Date.now()
  };

  it('should formulate a MODIFY decision when evidence is grounded and confidence is high', () => {
    const decision = engine.evaluate(sampleReasoning);
    expect(decision.decisionId).toBeDefined();
    expect(decision.type).toBe('MODIFY');
    expect(decision.confidence).toBe(0.9);
    expect(decision.status).toBe('VALIDATED');
    expect(decision.factors.length).toBeGreaterThanOrEqual(3);
  });

  it('should gate decision to NEEDS_INFORMATION when uncertainty exists or confidence is low', () => {
    const uncertainReasoning: ReasoningResult = {
      ...sampleReasoning,
      uncertainty: [{ type: 'INSUFFICIENT_EVIDENCE', reason: 'Missing auth server logs' }],
      confidence: 0.4,
      decision: {
        ...sampleReasoning.decision,
        status: 'NEEDS_MORE_INFORMATION'
      }
    };

    const decision = engine.evaluate(uncertainReasoning);
    expect(decision.type).toBe('NEEDS_INFORMATION');
    expect(decision.status).toBe('PROPOSED');
  });
});
