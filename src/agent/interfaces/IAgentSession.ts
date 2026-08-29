export interface IAgentSession {
  readonly sessionId: string;
  readonly repositoryId: string;
  
  recordTransition(from: string, to: string, timestamp: number): void;
  recordContextUsage(contextIds: string[]): void;
  getHistory(): { from: string; to: string; timestamp: number }[];
  getContextUsed(): string[];
}
