import { IAgentSession } from '../interfaces/IAgentSession';

export class AgentSession implements IAgentSession {
  private history: { from: string; to: string; timestamp: number }[] = [];
  private contextUsed: Set<string> = new Set();

  constructor(
    public readonly sessionId: string,
    public readonly repositoryId: string
  ) {}

  public recordTransition(from: string, to: string, timestamp: number): void {
    this.history.push({ from, to, timestamp });
  }

  public recordContextUsage(contextIds: string[]): void {
    for (const id of contextIds) {
      this.contextUsed.add(id);
    }
  }

  public getHistory(): { from: string; to: string; timestamp: number }[] {
    return [...this.history];
  }

  public getContextUsed(): string[] {
    return Array.from(this.contextUsed);
  }
}
