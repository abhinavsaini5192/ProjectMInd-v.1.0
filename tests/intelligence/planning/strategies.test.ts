import { describe, it, expect } from 'vitest';
import { BugFixPlanner } from '../../../src/intelligence/planning/strategies/BugFixPlanner';
import { FeaturePlanner } from '../../../src/intelligence/planning/strategies/FeaturePlanner';
import { RefactoringPlanner } from '../../../src/intelligence/planning/strategies/RefactoringPlanner';
import { ArchitectureChangePlanner } from '../../../src/intelligence/planning/strategies/ArchitectureChangePlanner';
import { InvestigationPlanner } from '../../../src/intelligence/planning/strategies/InvestigationPlanner';
import { Decision } from '../../../src/intelligence/planning/models/Decision';

describe('Planning Strategies (Phase 5.5)', () => {
  const bugFix = new BugFixPlanner();
  const feature = new FeaturePlanner();
  const refactor = new RefactoringPlanner();
  const arch = new ArchitectureChangePlanner();
  const inv = new InvestigationPlanner();

  const mockReasoning = {
    reasoningId: 'rsn_1',
    taskId: 't1',
    modelId: 'm1',
    contextPackageId: 'p1',
    promptVersion: '1.0',
    observations: [],
    evidence: [],
    hypotheses: [],
    conclusions: [{ statement: 'Fix timeout', evidenceIds: [], confidence: 0.9 }],
    assumptions: [],
    alternatives: [],
    uncertainty: [],
    recommendations: [],
    decision: { status: 'READY_FOR_EXECUTION' as any, targets: ['AuthService'], actions: [], constraints: [], requiredVerification: [], summary: 'Fix timeout' },
    confidence: 0.9,
    validationStatus: 'VALID' as any,
    schemaVersion: '1.0',
    strategyVersion: '1.0',
    createdAt: Date.now()
  };

  it('BugFixPlanner should construct phased steps (Inspect -> Test -> Modify -> Validate)', () => {
    const decision: Decision = {
      decisionId: 'd1',
      reasoningId: 'rsn_1',
      taskId: 't1',
      type: 'MODIFY',
      statement: 'AuthService',
      confidence: 0.9,
      factors: [],
      evidenceIds: [],
      rationale: 'Fix defect',
      status: 'VALIDATED',
      createdAt: Date.now()
    };

    expect(bugFix.supports(decision)).toBe(true);
    const plan = bugFix.buildPlan(decision, mockReasoning);
    expect(plan.steps.length).toBe(4);
    expect(plan.steps[0]!.type).toBe('INSPECT');
    expect(plan.steps[1]!.type).toBe('TEST');
    expect(plan.steps[2]!.type).toBe('MODIFY');
    expect(plan.steps[3]!.type).toBe('VALIDATE');
  });

  it('FeaturePlanner should support CREATE decisions', () => {
    const decision: Decision = {
      decisionId: 'd2',
      reasoningId: 'rsn_1',
      taskId: 't1',
      type: 'CREATE',
      statement: 'OAuthModule',
      confidence: 0.9,
      factors: [],
      evidenceIds: [],
      rationale: 'New feature',
      status: 'VALIDATED',
      createdAt: Date.now()
    };
    expect(feature.supports(decision)).toBe(true);
  });

  it('InvestigationPlanner should support NEEDS_INFORMATION decisions and generate InformationRequests', () => {
    const decision: Decision = {
      decisionId: 'd3',
      reasoningId: 'rsn_1',
      taskId: 't1',
      type: 'NEEDS_INFORMATION',
      statement: 'Unclear timeout cause',
      confidence: 0.4,
      factors: [],
      evidenceIds: [],
      rationale: 'Need logs',
      status: 'PROPOSED',
      createdAt: Date.now()
    };

    const uncertainReasoning = {
      ...mockReasoning,
      uncertainty: [{ type: 'INSUFFICIENT_EVIDENCE' as any, reason: 'Missing logs', missingInformation: ['auth_logs'] }]
    };

    expect(inv.supports(decision)).toBe(true);
    const plan = inv.buildPlan(decision, uncertainReasoning);
    expect(plan.informationRequests?.length).toBe(1);
    expect(plan.informationRequests?.[0]?.description).toBe('auth_logs');
  });
});
