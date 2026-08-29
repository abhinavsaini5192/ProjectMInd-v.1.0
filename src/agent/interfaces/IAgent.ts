import { AgentTask } from '../models/AgentTask';
import { AgentResult } from '../models/AgentResult';
import { AgentState } from '../core/AgentLifecycle';

export interface IAgent {
  readonly agentId: string;
  readonly sessionId: string;
  
  getState(): AgentState;
  submitTask(task: AgentTask): Promise<void>;
  start(): Promise<AgentResult>;
  cancel(reason?: string): void;
}
