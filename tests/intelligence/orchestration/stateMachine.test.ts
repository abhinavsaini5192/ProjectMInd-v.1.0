import { describe, it, expect } from 'vitest';
import { TaskStateMachine } from '../../../src/intelligence/orchestration/core/TaskStateMachine';
import { TaskState } from '../../../src/intelligence/orchestration/models/TaskState';
import { OrchestrationError } from '../../../src/intelligence/orchestration/errors/OrchestrationError';

describe('Orchestration: Task State Machine', () => {
  it('should allow valid sequential transitions and reject illegal transitions', () => {
    const sm = new TaskStateMachine();

    let state = sm.transition(TaskState.CREATED, TaskState.UNDERSTANDING);
    expect(state).toBe(TaskState.UNDERSTANDING);

    state = sm.transition(state, TaskState.CONTEXT_GATHERING);
    expect(state).toBe(TaskState.CONTEXT_GATHERING);

    state = sm.transition(state, TaskState.REASONING);
    expect(state).toBe(TaskState.REASONING);

    state = sm.transition(state, TaskState.PLANNING);
    expect(state).toBe(TaskState.PLANNING);

    // Illegal jump from PLANNING to COMPLETED directly
    expect(() => sm.transition(TaskState.PLANNING, TaskState.COMPLETED)).toThrow(OrchestrationError);
  });
});
