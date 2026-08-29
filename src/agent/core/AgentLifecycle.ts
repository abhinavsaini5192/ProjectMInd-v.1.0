import { InvalidAgentStateTransition } from '../errors/AgentErrors';

export enum AgentState {
  CREATED = 'CREATED',
  INITIALIZING = 'INITIALIZING',
  UNDERSTANDING = 'UNDERSTANDING',
  PLANNING = 'PLANNING',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  EXECUTING = 'EXECUTING',
  VERIFYING = 'VERIFYING',
  RECOVERING = 'RECOVERING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export class AgentLifecycle {
  private state: AgentState = AgentState.CREATED;

  private validTransitions: Record<AgentState, AgentState[]> = {
    [AgentState.CREATED]: [AgentState.INITIALIZING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.INITIALIZING]: [AgentState.UNDERSTANDING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.UNDERSTANDING]: [AgentState.PLANNING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.PLANNING]: [AgentState.WAITING_APPROVAL, AgentState.EXECUTING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.WAITING_APPROVAL]: [AgentState.EXECUTING, AgentState.PLANNING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.EXECUTING]: [AgentState.VERIFYING, AgentState.RECOVERING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.VERIFYING]: [AgentState.COMPLETED, AgentState.RECOVERING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.RECOVERING]: [AgentState.EXECUTING, AgentState.PLANNING, AgentState.CANCELLED, AgentState.FAILED],
    [AgentState.COMPLETED]: [], // Terminal
    [AgentState.FAILED]: [],    // Terminal
    [AgentState.CANCELLED]: []  // Terminal
  };

  public getState(): AgentState {
    return this.state;
  }

  public transitionTo(newState: AgentState): void {
    const allowed = this.validTransitions[this.state];
    
    if (!allowed || !allowed.includes(newState)) {
       throw new InvalidAgentStateTransition(this.state, newState);
    }
    
    this.state = newState;
  }

  public isTerminal(): boolean {
    return [AgentState.COMPLETED, AgentState.FAILED, AgentState.CANCELLED].includes(this.state);
  }
}
