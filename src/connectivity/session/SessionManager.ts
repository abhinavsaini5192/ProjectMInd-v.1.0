import { SessionDetails, SessionState } from '../interfaces';
import { InvalidSessionError } from '../errors/ConnectivityErrors';

/**
 * Manages active AI sessions.
 */
export class SessionManager {
  private sessions: Map<string, SessionDetails> = new Map();

  /**
   * Creates a new AI session.
   */
  public createSession(userId: string, role: string, workspace: string, repository: string): SessionDetails {
    const sessionId = `session_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();
    
    const details: SessionDetails = {
      userId,
      role,
      state: {
        id: sessionId,
        workspace,
        repository,
        contextBudget: 128000, // Default context budget in tokens
        memoryUsage: 0,
        createdAt: now,
        lastActive: now
      }
    };

    this.sessions.set(sessionId, details);
    return details;
  }

  /**
   * Retrieves an active session and updates its lastActive timestamp.
   * Throws if session does not exist.
   */
  public getSession(sessionId: string): SessionDetails {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new InvalidSessionError(`Session ${sessionId} not found or expired.`);
    }
    
    session.state.lastActive = Date.now();
    return session;
  }

  /**
   * Closes and removes a session.
   */
  public closeSession(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      throw new InvalidSessionError(`Session ${sessionId} not found.`);
    }
    this.sessions.delete(sessionId);
  }

  /**
   * Periodically cleans up stale sessions (e.g., inactive for > 1 hour).
   */
  public cleanupStaleSessions(timeoutMs = 3600000): void {
    const now = Date.now();
    for (const [sessionId, details] of this.sessions.entries()) {
      if (now - details.state.lastActive > timeoutMs) {
        this.sessions.delete(sessionId);
      }
    }
  }

  public getActiveSessionCount(): number {
    return this.sessions.size;
  }
}
