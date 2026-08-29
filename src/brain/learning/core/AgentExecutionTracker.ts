import { AgentSession } from '../models/AgentSession';
import { SessionTracker } from './SessionTracker';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { AGENT_SESSION_STARTED, AGENT_SESSION_COMPLETED } from '../types/LearningEvents';

export class AgentExecutionTracker {
  constructor(
    private sessionTracker: SessionTracker,
    private dispatcher: KernelEventDispatcher
  ) {}

  public startSession(decisionId: string, agentId: string, sessionId: string): AgentSession {
    const session: AgentSession = {
      sessionId,
      decisionId,
      agentId,
      startTime: Date.now(),
      status: 'IN_PROGRESS',
      changedFiles: [],
      iterations: 0
    };
    
    this.sessionTracker.recordSession(session);
    this.dispatcher.publish(AGENT_SESSION_STARTED, { sessionId });
    return session;
  }

  public completeSession(session: AgentSession, changedFiles: string[], testResults?: { passed: number, failed: number }): void {
    session.endTime = Date.now();
    session.status = 'COMPLETED';
    session.changedFiles = changedFiles;
    session.testResults = testResults;
    
    this.dispatcher.publish(AGENT_SESSION_COMPLETED, { sessionId: session.sessionId });
  }
}
