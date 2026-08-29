import { describe, it, expect } from 'vitest';
import { LoopGuard } from '../../../src/intelligence/orchestration/guards/LoopGuard';
import { TaskCycle } from '../../../src/intelligence/orchestration/models/TaskCycle';
import { TaskStalledError } from '../../../src/intelligence/orchestration/errors/TaskStalledError';

describe('Orchestration: Loop Guard & Stall Detection', () => {
  it('should detect repeated failing plans and throw TaskStalledError', () => {
    const loopGuard = new LoopGuard();

    const cycles: TaskCycle[] = [
      { cycleId: 'c1', taskId: 't1', cycleNumber: 1, planId: 'plan_A', outcome: 'FAILED', startedAt: 100, completedAt: 200 },
      { cycleId: 'c2', taskId: 't1', cycleNumber: 2, planId: 'plan_A', outcome: 'FAILED', startedAt: 201, completedAt: 300 }
    ];

    expect(() => loopGuard.detectLoops(cycles)).toThrow(TaskStalledError);
  });

  it('should detect oscillating A -> B -> A -> B loops and throw TaskStalledError', () => {
    const loopGuard = new LoopGuard();

    const cycles: TaskCycle[] = [
      { cycleId: 'c1', taskId: 't1', cycleNumber: 1, planId: 'plan_A', startedAt: 100 },
      { cycleId: 'c2', taskId: 't1', cycleNumber: 2, planId: 'plan_B', startedAt: 200 },
      { cycleId: 'c3', taskId: 't1', cycleNumber: 3, planId: 'plan_A', startedAt: 300 },
      { cycleId: 'c4', taskId: 't1', cycleNumber: 4, planId: 'plan_B', startedAt: 400 }
    ];

    expect(() => loopGuard.detectLoops(cycles)).toThrow(TaskStalledError);
  });
});
