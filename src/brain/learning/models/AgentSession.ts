export interface AgentSession {
  sessionId: string;
  decisionId: string;
  agentId: string; // e.g., 'cursor', 'claude-3.5', 'human'
  startTime: number;
  endTime?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  changedFiles: string[];
  iterations: number;
  testResults?: { passed: number; failed: number };
}
