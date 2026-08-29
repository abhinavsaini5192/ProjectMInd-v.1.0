import { ActionGraph } from '../../actions/models/ActionGraph';
import { AgentAction } from '../../actions/models/AgentAction';
import { ExecutionState } from '../models/ExecutionState';
import { ActionResult } from '../models/ActionResult';

export class ExecutionScheduler {
  private actionStates: Map<string, ExecutionState> = new Map();
  private maxConcurrency = 1;

  public initialize(graph: ActionGraph): void {
    for (const action of graph.getAllActions()) {
      this.actionStates.set(action.actionId, ExecutionState.PENDING);
    }
  }

  public updateActionState(actionId: string, state: ExecutionState): void {
    this.actionStates.set(actionId, state);
  }

  public getNextReadyActions(graph: ActionGraph): AgentAction[] {
    const readyActions: AgentAction[] = [];
    const runningCount = Array.from(this.actionStates.values()).filter(s => s === ExecutionState.RUNNING).length;

    if (runningCount >= this.maxConcurrency) return [];

    for (const action of graph.getAllActions()) {
      if (this.actionStates.get(action.actionId) !== ExecutionState.PENDING) continue;

      let canRun = true;
      for (const depId of action.dependencies) {
        const depState = this.actionStates.get(depId);
        
        // If a dependency failed or was blocked, this action is blocked
        if (depState === ExecutionState.FAILED || depState === ExecutionState.BLOCKED) {
           this.actionStates.set(action.actionId, ExecutionState.BLOCKED);
           canRun = false;
           break;
        }

        // If a dependency hasn't succeeded yet, we wait
        if (depState !== ExecutionState.SUCCEEDED) {
           canRun = false;
           break;
        }
      }

      if (canRun) {
        readyActions.push(action);
      }
    }

    return readyActions.slice(0, this.maxConcurrency - runningCount);
  }

  public getFinalStates(): Map<string, ExecutionState> {
    return this.actionStates;
  }
}
