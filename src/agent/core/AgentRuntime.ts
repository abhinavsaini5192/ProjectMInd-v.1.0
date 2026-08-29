import { IAgentRuntime } from '../interfaces/IAgentRuntime';
import { IAgent } from '../interfaces/IAgent';
import { IBrainGateway } from '../interfaces/IBrainGateway';
import { AgentTask } from '../models/AgentTask';
import { AgentResult } from '../models/AgentResult';
import { Agent } from './Agent';
import { KernelEventDispatcher } from '../../kernel/core/KernelEventDispatcher';

export class AgentRuntime implements IAgentRuntime {
  private agents: Map<string, IAgent> = new Map();

  constructor(
    private dispatcher: KernelEventDispatcher,
    private brainGateway: IBrainGateway
  ) {}

  public createAgent(repositoryId: string): IAgent {
    const agentId = `agent_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const sessionId = `sess_${agentId}`;
    
    const agent = new Agent(agentId, sessionId, repositoryId, this.dispatcher, this.brainGateway);
    this.agents.set(agentId, agent);
    
    return agent;
  }

  public getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  public async executeTask(task: AgentTask): Promise<AgentResult> {
    const agent = this.createAgent(task.repositoryId);
    await agent.submitTask(task);
    return agent.start();
  }
}
