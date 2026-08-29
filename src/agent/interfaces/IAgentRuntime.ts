import { IAgent } from './IAgent';
import { AgentTask } from '../models/AgentTask';
import { AgentResult } from '../models/AgentResult';

export interface IAgentRuntime {
  createAgent(repositoryId: string): IAgent;
  executeTask(task: AgentTask): Promise<AgentResult>;
  getAgent(agentId: string): IAgent | undefined;
}
