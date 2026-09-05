import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAgent } from './fixtures';
import type { TestAgentEnvironment } from './fixtures';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';

describe('ProjectMindAgent: Multi-Cycle Execution Loop', () => {
  let env: TestAgentEnvironment;

  beforeEach(async () => {
    env = await createTestAgent();
  });

  it('should support multi-cycle task execution and aggregate cycles in report', async () => {
    const req: AgentRequest = {
      requestId: 'req-multi-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Refactor auth with multi-step validation',
      autonomyLevel: 'LEVEL_3_BOUNDED_AUTONOMOUS',
      budget: {
        maxCycles: 3,
      },
    };

    const response = await env.agent.runTask(req);
    expect(response.taskId).toBe('req-multi-1');
    expect(response.progress.completedCycles).toBeGreaterThanOrEqual(1);

    const report = await env.agent.explainTask('req-multi-1');
    expect(report.taskId).toBe('req-multi-1');
    expect(report.timeline.length).toBeGreaterThan(0);
  });
});
