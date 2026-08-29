import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentRuntime } from '../../src/agent/core/AgentRuntime';
import { Agent } from '../../src/agent/core/Agent';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { IBrainGateway } from '../../src/agent/interfaces/IBrainGateway';
import { AgentTask } from '../../src/agent/models/AgentTask';
import { ContextPackage } from '../../src/intelligence/fusion/models/ContextPackage';
import { AgentState } from '../../src/agent/core/AgentLifecycle';
import { InvalidAgentStateTransition } from '../../src/agent/errors/AgentErrors';
import { AgentEventType } from '../../src/agent/events/AgentEvents';

// Mock IBrainGateway
class MockBrainGateway implements IBrainGateway {
  public async requestContext(task: AgentTask): Promise<ContextPackage> {
    return {
      task: task.request,
      primaryContext: ['file1.ts', 'file2.ts'],
      secondaryContext: [],
      architecture: [],
      dependencies: [],
      recentChanges: [],
      knownProblems: [],
      decisions: [],
      confidence: 0.9
    };
  }
}

describe('Agent Core & Runtime (Phase 4.1)', () => {
  let dispatcher: KernelEventDispatcher;
  let brainGateway: IBrainGateway;
  let runtime: AgentRuntime;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    brainGateway = new MockBrainGateway();
    runtime = new AgentRuntime(dispatcher, brainGateway);
  });

  const mockTask: AgentTask = {
    taskId: 'task_001',
    repositoryId: 'repo_123',
    request: 'Fix the login bug',
    priority: 1,
    constraints: [],
    contextMode: 'STRICT',
    createdAt: Date.now(),
    metadata: {}
  };

  it('should instantiate an agent and transition through a successful lifecycle', async () => {
    let completedEventFired = false;
    dispatcher.subscribe(AgentEventType.TASK_COMPLETED, () => {
       completedEventFired = true;
    });

    const result = await runtime.executeTask(mockTask);
    
    expect(result.status).toBe(AgentState.COMPLETED);
    expect(result.contextUsed).toContain('file1.ts');
    expect(result.verification.passed).toBe(true);
    expect(completedEventFired).toBe(true);
  });

  it('should prevent invalid state transitions', async () => {
    const agent = runtime.createAgent('repo_123') as Agent;
    
    // agent is in CREATED state. Cannot transition to EXECUTING directly.
    expect(() => {
       (agent as any).transition(AgentState.EXECUTING);
    }).toThrow(InvalidAgentStateTransition);
  });

  it('should correctly handle cancellation', async () => {
    const agent = runtime.createAgent('repo_123') as Agent;
    await agent.submitTask(mockTask);
    
    let cancelledEventFired = false;
    dispatcher.subscribe(AgentEventType.AGENT_CANCELLED, () => {
       cancelledEventFired = true;
    });

    agent.cancel('User requested cancellation');

    expect(agent.getState()).toBe(AgentState.CANCELLED);
    expect(cancelledEventFired).toBe(true);
  });

  it('should track session history', async () => {
    const agent = runtime.createAgent('repo_123') as Agent;
    await agent.submitTask(mockTask);
    await agent.start();

    // Reaching into the session to verify transitions were recorded
    const session = (agent as any).session;
    const history = session.getHistory();
    
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].from).toBe(AgentState.CREATED);
    expect(history[0].to).toBe(AgentState.INITIALIZING);
  });

  it('should correctly handle Brain Gateway failures', async () => {
    const failingBrain = new MockBrainGateway();
    failingBrain.requestContext = vi.fn().mockRejectedValue(new Error('Brain timeout'));
    
    const failingRuntime = new AgentRuntime(dispatcher, failingBrain);
    
    const result = await failingRuntime.executeTask(mockTask);
    
    expect(result.status).toBe(AgentState.FAILED);
    expect(result.errors[0]).toContain('Brain timeout');
    expect(result.verification.passed).toBe(false);
  });
});
