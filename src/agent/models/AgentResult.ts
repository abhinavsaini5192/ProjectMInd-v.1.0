import { AgentState } from '../core/AgentLifecycle';

export interface AgentResult {
  taskId: string;
  status: AgentState;
  changes: string[]; // Mocked for now, as no real execution occurs
  verification: {
    passed: boolean;
    logs: string[];
  };
  errors: string[];
  contextUsed: string[];
  executionTimeMs: number;
  completedAt: number;
}
