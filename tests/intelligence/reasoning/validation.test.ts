import { describe, it, expect } from 'vitest';
import { SchemaValidator } from '../../../src/intelligence/reasoning/validation/SchemaValidator';
import { EvidenceValidator } from '../../../src/intelligence/reasoning/validation/EvidenceValidator';
import { ConsistencyValidator } from '../../../src/intelligence/reasoning/validation/ConsistencyValidator';
import { ConfidenceValidator } from '../../../src/intelligence/reasoning/validation/ConfidenceValidator';
import { ReasoningValidator } from '../../../src/intelligence/reasoning/validation/ReasoningValidator';
import { ContextPackage } from '../../../src/intelligence/context/models/ContextPackage';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Reasoning Validation Subsystem (Phase 5.4)', () => {
  const schemaValidator = new SchemaValidator();
  const evidenceValidator = new EvidenceValidator();
  const consistencyValidator = new ConsistencyValidator();
  const confidenceValidator = new ConfidenceValidator();
  const compositeValidator = new ReasoningValidator();

  const mockContextPackage: ContextPackage = {
    packageId: 'pkg_1',
    planId: 'plan_1',
    taskId: 'Fix session',
    summary: 'Summary',
    items: [{
      id: 'sym_auth_123',
      type: ContextType.SYMBOL,
      content: 'AuthService definition',
      sources: [{
        sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
        sourceId: 'src_auth_valid',
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
    tokenEstimate: 100,
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

  it('SchemaValidator should reject missing required IDs or invalid confidence', () => {
    const res = schemaValidator.validate({
      reasoningId: '',
      confidence: -0.5
    });
    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('Missing reasoningId'))).toBe(true);
    expect(res.issues.some(i => i.includes('Invalid confidence score'))).toBe(true);
  });

  it('EvidenceValidator should reject fabricated source IDs', () => {
    const res = evidenceValidator.validate({
      evidence: [{
        evidenceId: 'ev_1',
        type: 'SYMBOL',
        sourceId: 'fabricated_non_existent_source_999',
        claim: 'Nonexistent symbol fact',
        confidence: 0.9
      }]
    }, mockContextPackage);

    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('Fabricated or ungrounded evidence'))).toBe(true);
  });

  it('ConsistencyValidator should flag contradictory conclusions', () => {
    const res = consistencyValidator.validate({
      conclusions: [
        { statement: 'Module Auth directly depends on SessionManager', evidenceIds: [], confidence: 0.8 },
        { statement: 'Module Auth does not depend on SessionManager', evidenceIds: [], confidence: 0.8 }
      ]
    });

    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('Contradictory conclusions detected'))).toBe(true);
  });

  it('ConfidenceValidator should flag high confidence without supporting evidence or observations', () => {
    const res = confidenceValidator.validate({
      confidence: 0.95,
      evidence: [],
      observations: []
    });

    expect(res.valid).toBe(false);
    expect(res.issues.some(i => i.includes('Overconfident assertion'))).toBe(true);
  });

  it('Composite ReasoningValidator should compute overall status', () => {
    const validReport = compositeValidator.validate({
      reasoningId: 'rsn_1',
      taskId: 'task_1',
      modelId: 'model_1',
      contextPackageId: 'pkg_1',
      confidence: 0.8,
      decision: { status: 'READY_FOR_EXECUTION', targets: ['AuthService'], actions: [], constraints: [], requiredVerification: [], summary: 'Fix timeout' },
      evidence: [{ evidenceId: 'ev_1', type: 'SYMBOL', sourceId: 'src_auth_valid', claim: 'Auth valid', confidence: 0.8 }]
    }, mockContextPackage);

    expect(validReport.status).toBe('VALID');
    expect(validReport.valid).toBe(true);
  });
});
