import { IAgent } from '../interfaces/IAgent';
import { IBrainGateway } from '../interfaces/IBrainGateway';
import { AgentTask } from '../models/AgentTask';
import { AgentResult } from '../models/AgentResult';
import { AgentLifecycle, AgentState } from './AgentLifecycle';
import { AgentSession } from './AgentSession';
import { AgentEventType } from '../events/AgentEvents';
import { KernelEventDispatcher } from '../../kernel/core/KernelEventDispatcher';
import { AgentTaskError, AgentCancelledError } from '../errors/AgentErrors';

export class Agent implements IAgent {
  private lifecycle: AgentLifecycle;
  private session: AgentSession;
  private task: AgentTask | null = null;
  private startTime: number = 0;

  constructor(
    public readonly agentId: string,
    public readonly sessionId: string,
    private repositoryId: string,
    private dispatcher: KernelEventDispatcher,
    private brainGateway: IBrainGateway
  ) {
    this.lifecycle = new AgentLifecycle();
    this.session = new AgentSession(sessionId, repositoryId);
    this.emitEvent(AgentEventType.AGENT_CREATED);
  }

  public getState(): AgentState {
    return this.lifecycle.getState();
  }

  private transition(newState: AgentState) {
    const oldState = this.lifecycle.getState();
    this.lifecycle.transitionTo(newState);
    this.session.recordTransition(oldState, newState, Date.now());
  }

  private emitEvent(type: AgentEventType, metadata?: any) {
    this.dispatcher.publish(type, {
      agentId: this.agentId,
      sessionId: this.sessionId,
      repositoryId: this.repositoryId,
      taskId: this.task?.taskId || 'unassigned',
      timestamp: Date.now(),
      metadata
    });
  }

  public async submitTask(task: AgentTask): Promise<void> {
    if (this.task) {
      throw new AgentTaskError('Agent already has an assigned task');
    }
    this.task = task;
    this.emitEvent(AgentEventType.TASK_RECEIVED);
  }

  public async start(): Promise<AgentResult> {
    if (!this.task) {
      throw new AgentTaskError('Cannot start agent without a task');
    }

    this.startTime = Date.now();
    this.emitEvent(AgentEventType.AGENT_STARTED);

    try {
      this.transition(AgentState.INITIALIZING);
      
      // Phase 1: Understanding
      this.transition(AgentState.UNDERSTANDING);
      this.emitEvent(AgentEventType.UNDERSTANDING_STARTED);
      
      const contextPackage = await this.brainGateway.requestContext(this.task);
      this.session.recordContextUsage(contextPackage.primaryContext);
      this.session.recordContextUsage(contextPackage.secondaryContext);
      
      this.emitEvent(AgentEventType.UNDERSTANDING_COMPLETED);

      // Phase 2: Planning (Mocked for 4.1)
      this.transition(AgentState.PLANNING);
      this.emitEvent(AgentEventType.PLANNING_STARTED);
      
      // We pause here as actual execution is forbidden in 4.1
      this.emitEvent(AgentEventType.PLANNING_COMPLETED);
      
      this.transition(AgentState.WAITING_APPROVAL);

      // Fake success outcome for Phase 4.1
      this.transition(AgentState.EXECUTING);
      this.emitEvent(AgentEventType.EXECUTION_STARTED);
      
      this.transition(AgentState.VERIFYING);
      this.emitEvent(AgentEventType.VERIFICATION_STARTED);
      
      this.transition(AgentState.COMPLETED);
      this.emitEvent(AgentEventType.TASK_COMPLETED);

      return this.buildResult();

    } catch (error) {
      if (error instanceof AgentCancelledError) {
         this.transition(AgentState.CANCELLED);
         this.emitEvent(AgentEventType.AGENT_CANCELLED);
      } else {
         this.transition(AgentState.FAILED);
         this.emitEvent(AgentEventType.TASK_FAILED, { error: (error as Error).message });
      }
      return this.buildResult([ (error as Error).message ]);
    }
  }

  public cancel(reason?: string): void {
    if (this.lifecycle.isTerminal()) {
       return;
    }
    
    // We force a throw if start() is awaiting a promise, 
    // but practically we change state and rely on checks.
    // For synchronous flow in this mock, we transition directly.
    this.transition(AgentState.CANCELLED);
    this.emitEvent(AgentEventType.AGENT_CANCELLED, { reason });
  }

  private buildResult(errors: string[] = []): AgentResult {
    return {
      taskId: this.task!.taskId,
      status: this.lifecycle.getState(),
      changes: [],
      verification: {
        passed: this.lifecycle.getState() === AgentState.COMPLETED,
        logs: []
      },
      errors,
      contextUsed: this.session.getContextUsed(),
      executionTimeMs: Date.now() - this.startTime,
      completedAt: Date.now()
    };
  }
}
