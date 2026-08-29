import { AgentAction } from './AgentAction';

export class ActionGraph {
  private actions: Map<string, AgentAction> = new Map();

  public addAction(action: AgentAction): void {
    if (this.actions.has(action.actionId)) {
      throw new Error(`Action ${action.actionId} already exists in the graph.`);
    }
    this.actions.set(action.actionId, action);
  }

  public getAction(actionId: string): AgentAction | undefined {
    return this.actions.get(actionId);
  }

  public getAllActions(): AgentAction[] {
    return Array.from(this.actions.values());
  }

  public validateAcyclic(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (actionId: string) => {
      if (recursionStack.has(actionId)) {
        throw new Error(`Circular dependency detected at action: ${actionId}`);
      }
      if (visited.has(actionId)) return;

      recursionStack.add(actionId);
      
      const action = this.actions.get(actionId);
      if (action) {
        for (const depId of action.dependencies) {
          dfs(depId);
        }
      }

      recursionStack.delete(actionId);
      visited.add(actionId);
    };

    for (const actionId of this.actions.keys()) {
      dfs(actionId);
    }
  }
}
