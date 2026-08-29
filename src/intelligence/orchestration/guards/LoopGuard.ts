import { TaskCycle } from '../models/TaskCycle';
import { TaskStalledError } from '../errors/TaskStalledError';

export class LoopGuard {
  public detectLoops(cycles: TaskCycle[]): void {
    if (cycles.length < 2) return;

    // 1. Check repeated plan failures (consecutive cycles with same plan or identical failures)
    const recent = cycles.slice(-3);
    if (recent.length >= 2) {
      const last = recent[recent.length - 1];
      const prev = recent[recent.length - 2];

      if (last.planId && prev.planId && last.planId === prev.planId && last.outcome === 'FAILED' && prev.outcome === 'FAILED') {
        throw new TaskStalledError('Repeated failing plan detected without modifications', 'Same plan failed consecutively');
      }
    }

    // 2. Check oscillating A -> B -> A pattern
    if (cycles.length >= 4) {
      const c1 = cycles[cycles.length - 4].planId;
      const c2 = cycles[cycles.length - 3].planId;
      const c3 = cycles[cycles.length - 2].planId;
      const c4 = cycles[cycles.length - 1].planId;

      if (c1 && c2 && c3 && c4 && c1 === c3 && c2 === c4) {
        throw new TaskStalledError('Oscillating cycle loop detected (A -> B -> A -> B)', 'Oscillation across plans');
      }
    }
  }
}
