import { AgentSession } from '../models/AgentSession';

export class SessionTracker {
  private sessions: Map<string, AgentSession[]> = new Map(); // Keyed by decisionId

  public recordSession(session: AgentSession): void {
    if (!this.sessions.has(session.decisionId)) {
      this.sessions.set(session.decisionId, []);
    }
    this.sessions.get(session.decisionId)!.push(session);
  }

  public getSessionsForDecision(decisionId: string): AgentSession[] {
    return this.sessions.get(decisionId) || [];
  }
}
