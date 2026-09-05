import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAgent } from './fixtures';
import type { TestAgentEnvironment } from './fixtures';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';
import { FailureTaxonomy } from '../../../src/intelligence/agent/taxonomy/FailureTaxonomy';

describe('ProjectMindAgent: Budget Enforcement & Limits', () => {
  let env: TestAgentEnvironment;

  beforeEach(async () => {
    env = await createTestAgent();
  });

  it('should classify budget exceeded errors correctly', () => {
    const error = new Error('Task token limit exceeded: maximum allowed tokens 4000');
    const record = FailureTaxonomy.classify(error, 'BudgetGuard');

    expect(record.category).toBe('BUDGET_EXCEEDED');
    expect(record.fatal).toBe(true);
    expect(record.recoveryAction).toBe('ABORT');
  });

  it('should enforce cycle budget limits and return bounded outcome', async () => {
    const req: AgentRequest = {
      requestId: 'req-budget-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Run bounded task with 1 cycle budget',
      budget: {
        maxCycles: 1,
      },
    };

    const response = await env.agent.runTask(req);
    expect(response.taskId).toBe('req-budget-1');
    expect(response.progress.maxCycles).toBe(1);
  });
});
