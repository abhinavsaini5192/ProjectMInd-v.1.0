import { ReasoningState } from '../models/ReasoningState';

export class ReasoningStateManager {
  private states: Map<string, ReasoningState> = new Map();

  public save(state: ReasoningState): void {
     // Ensure sensitive information is redacted (Mocked via string replacement)
     const serialized = JSON.stringify(state).replace(/secret|password/gi, '[REDACTED]');
     this.states.set(state.stateId, JSON.parse(serialized));
  }

  public get(stateId: string): ReasoningState | undefined {
     return this.states.get(stateId);
  }

  public invalidateStale(snapshotId: string): void {
     // If the L2 knowledge snapshot changes, older reasoning states become stale
     for (const [id, state] of this.states.entries()) {
        if (state.snapshotId !== snapshotId) {
           state.isStale = true;
           this.states.set(id, state);
        }
     }
  }
}
