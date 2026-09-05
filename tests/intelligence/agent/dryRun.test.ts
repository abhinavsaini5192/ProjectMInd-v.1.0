import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAgent } from './fixtures';
import type { TestAgentEnvironment } from './fixtures';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';

describe('ProjectMindAgent: Dry Run Execution Mode', () => {
  let env: TestAgentEnvironment;

  beforeEach(async () => {
    env = await createTestAgent();
  });

  it('should execute task in dryRun mode without applying destructive modifications', async () => {
    const req: AgentRequest = {
      requestId: 'req-dry-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Clean up unused files in repository',
      dryRun: true,
      autonomyLevel: 'LEVEL_3_BOUNDED_AUTONOMOUS',
    };

    const response = await env.agent.runTask(req);

    expect(response.taskId).toBe('req-dry-1');
    expect(response.outcome).toBe('SUCCESS');

    const auditEntries = env.agent.getAuditTrail().getEntriesForTask('req-dry-1');
    expect(auditEntries.length).toBeGreaterThan(0);
  });
});
