import { describe, it, expect } from 'vitest';
import { MemoryFeedbackBridge } from '../../../src/intelligence/orchestration/core/MemoryFeedbackBridge';
import { LoopStatus } from '../../../src/intelligence/orchestration/models/LoopState';

describe('Memory Feedback Bridge (Phase 5.6)', () => {
  it('should record episodic memories from completed closed-loop tasks', async () => {
    const bridge = new MemoryFeedbackBridge();
    await bridge.recordOutcome({
      loopId: 'l1',
      taskId: 'task_auth_fix',
      status: LoopStatus.COMPLETED,
      iterations: [{ iterationNumber: 1, startedAt: 0, completedAt: 100 }],
      totalDurationMs: 100,
      finalDecisionSummary: 'AuthService timeout increased',
      changesApplied: ['MODIFY: AuthService'],
      verificationPassed: true,
      approvalRequired: false,
      lineage: { taskId: 'task_auth_fix' },
      errors: []
    });

    const memories = bridge.getMemories();
    expect(memories.length).toBe(1);
    expect(memories[0]!.taskId).toBe('task_auth_fix');
    expect(memories[0]!.success).toBe(true);
    expect(memories[0]!.lessonsLearned[0]).toContain('Successful resolution');
  });
});
