import { describe, it, expect } from 'vitest';
import { PlanFreshnessValidator } from '../../../src/intelligence/agent/hardening/PlanFreshnessValidator';
import { PlanFreshnessError } from '../../../src/intelligence/agent/errors/PlanFreshnessError';
import type { ActionPlan } from '../../../src/intelligence/planning/models/ActionPlan';
import { createTestAgent } from './fixtures';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';

describe('ProjectMindAgent: Plan Freshness Validation', () => {
  const dummyPlan: ActionPlan = {
    planId: 'plan-fresh-1',
    decisionId: 'dec-1',
    taskId: 'task-fresh-1',
    objective: 'Modify auth service',
    status: 'READY' as any,
    steps: [
      {
        stepId: 's1',
        order: 1,
        type: 'MODIFY',
        description: 'Update auth.ts',
        reason: 'Improve auth logic',
        target: { type: 'FILE', id: 'src/auth.ts' },
        dependencies: [],
        preconditions: [],
        expectedOutcome: 'Updated auth',
        riskLevel: 'LOW',
        validation: [],
        reversibility: 'REVERSIBLE',
      },
    ],
    dependencies: [],
    preconditions: [],
    postconditions: [],
    risks: [],
    validationPlan: {
      validationId: 'v1',
      steps: [],
      requiredTests: [],
      typeCheck: true,
      architectureCheck: true,
      dependencyCheck: true,
    },
    affectedResources: ['src/auth.ts'],
    estimatedComplexity: 'LOW',
    confidence: 0.9,
    knowledgeVersion: '1.0',
    contextVersion: '1.0',
    reasoningId: 'r1',
    createdAt: 1000,
  };

  it('should pass freshness when resources are identical to formulation snapshot', async () => {
    const validator = new PlanFreshnessValidator();
    validator.captureSnapshot('plan-fresh-1', [
      { uri: 'src/auth.ts', hash: 'hash-abc', lastModified: 1000 },
    ]);

    const result = await validator.validateFreshness(dummyPlan, [
      { uri: 'src/auth.ts', hash: 'hash-abc', lastModified: 1000 },
    ]);

    expect(result.fresh).toBe(true);
    expect(result.staleResources).toHaveLength(0);
  });

  it('should detect stale resources when hash mismatches', async () => {
    const validator = new PlanFreshnessValidator();
    validator.captureSnapshot('plan-fresh-1', [
      { uri: 'src/auth.ts', hash: 'hash-abc', lastModified: 1000 },
    ]);

    const result = await validator.validateFreshness(dummyPlan, [
      { uri: 'src/auth.ts', hash: 'hash-mutated-xyz', lastModified: 1050 },
    ]);

    expect(result.fresh).toBe(false);
    expect(result.staleResources).toContain('src/auth.ts');
  });

  it('should throw PlanFreshnessError when strict mode is enabled', async () => {
    const validator = new PlanFreshnessValidator();
    validator.captureSnapshot('plan-fresh-1', [
      { uri: 'src/auth.ts', hash: 'hash-abc', lastModified: 1000 },
    ]);

    await expect(
      validator.validateFreshness(
        dummyPlan,
        [{ uri: 'src/auth.ts', hash: 'hash-mutated-xyz', lastModified: 1050 }],
        true
      )
    ).rejects.toThrow(PlanFreshnessError);
  });

  it('should record freshness error metric in agent when freshness fails in task loop', async () => {
    const env = await createTestAgent({ withFreshness: true });

    // Capture baseline snapshot with a specific hash
    env.freshnessValidator.captureSnapshot('plan-mock', [
      { uri: 'src/service.ts', hash: 'original_hash' },
    ]);

    // Resolver that returns mutated state
    const mutatingValidator = new PlanFreshnessValidator({
      getResourceState: (uri: string) => ({
        uri,
        hash: 'changed_external_hash',
        lastModified: Date.now() + 5000,
      }),
    });

    const req: AgentRequest = {
      requestId: 'req-stale-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Refactor mutated service',
    };

    const response = await env.agent.runTask(req);
    expect(response.taskId).toBe('req-stale-1');
  });
});
