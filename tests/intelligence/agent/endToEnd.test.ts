import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAgent } from './fixtures';
import type { TestAgentEnvironment } from './fixtures';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';
import { TaskState } from '../../../src/intelligence/orchestration/models/TaskState';

describe('ProjectMindAgent: End-to-End Task Lifecycle', () => {
  let env: TestAgentEnvironment;

  beforeEach(async () => {
    env = await createTestAgent();
  });

  it('should create and initialize a task via createTask', async () => {
    const req: AgentRequest = {
      requestId: 'req-e2e-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Refactor user service to add caching',
      autonomyLevel: 'LEVEL_2_CONTROLLED',
      constraints: ['No external redis dependency'],
    };

    const task = await env.agent.createTask(req);
    expect(task.taskId).toBe('req-e2e-1');
    expect(task.status).toBe(TaskState.CREATED);
    expect(task.constraints).toContain('No external redis dependency');

    const metrics = env.agent.getMetrics();
    expect(metrics.tasksStarted).toBe(1);

    const audit = env.agent.getAuditTrail().getEntriesForTask('req-e2e-1');
    expect(audit.length).toBeGreaterThan(0);
    expect(audit[0]?.action).toBe('TASK_CREATED');
  });

  it('should run a successful task end-to-end and return AgentResponse', async () => {
    env.mockProvider.setOverrideResponse({
      structuredOutput: {
        observations: [{ statement: 'Need memory cache layer', type: 'OBSERVATION' }],
        hypotheses: [{ statement: 'Cache in-memory reduces query latency', confidence: 0.95 }],
        assumptions: [],
        uncertainties: [],
        decision: {
          type: 'PROCEED_WITH_PLAN',
          status: 'RESOLVED',
          confidence: 0.95,
          recommendedAction: 'Implement MemoryCache',
          justification: 'Reduces latency without external dependencies',
          invalidationTriggers: [],
        },
        risks: [],
        nextSteps: ['Create MemoryCache', 'Test latency'],
      },
    });

    const req: AgentRequest = {
      requestId: 'req-e2e-2',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Implement memory cache for user lookups',
      autonomyLevel: 'LEVEL_3_BOUNDED_AUTONOMOUS',
    };

    const response = await env.agent.runTask(req);

    expect(response.taskId).toBe('req-e2e-2');
    expect(response.outcome).toBe('SUCCESS');
    expect(response.progress.percent).toBe(100);
    expect(response.verification.passed).toBe(true);
    expect(response.nextAction).toBe('NONE');

    const metrics = env.agent.getMetrics();
    expect(metrics.tasksCompleted).toBe(1);

    // Test explainability APIs
    const report = await env.agent.explainTask('req-e2e-2');
    expect(report.taskId).toBe('req-e2e-2');
    expect(report.timeline.length).toBeGreaterThan(0);
    expect(report.reasoningSummary.decisionsMade).toContain('PROCEED_WITH_PLAN');

    const contextReport = await env.agent.explainContext('req-e2e-2');
    expect(contextReport).toBeDefined();

    const decisionReport = await env.agent.explainDecision('req-e2e-2');
    expect(decisionReport.decisionsMade).toContain('PROCEED_WITH_PLAN');
  });

  it('should support task pausing and cancellation controls', async () => {
    const req: AgentRequest = {
      requestId: 'req-control-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Long running optimization',
      autonomyLevel: 'LEVEL_2_CONTROLLED',
    };

    // Run task to create active entry
    const taskPromise = env.agent.runTask(req);
    const initialResponse = await taskPromise;

    expect(initialResponse.taskId).toBe('req-control-1');

    // Test cancel
    await env.agent.cancelTask('req-control-1');
    const task = await env.agent.getTask('req-control-1');
    expect(task?.status).toBe(TaskState.CANCELLED);
  });

  it('should preview task with decomposition estimation', async () => {
    const preview = await env.agent.previewTask({
      requestId: 'prev-1',
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      userRequest: 'Optimize database index layout',
    });

    expect(preview.goal).toBeDefined();
    expect(preview.estimatedCycles).toBe(2);
    expect(preview.risk).toBe('LOW');
  });
});
