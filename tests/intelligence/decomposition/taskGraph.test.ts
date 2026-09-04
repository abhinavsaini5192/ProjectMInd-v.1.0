import { describe, it, expect } from 'vitest';
import { DecompositionGuard } from '../../../src/intelligence/decomposition/guards/DecompositionGuard';
import { DecompositionError } from '../../../src/intelligence/decomposition/errors/DecompositionError';
import { TaskGraph } from '../../../src/intelligence/decomposition/models/TaskGraph';

describe('TaskGraph Validation & Cycle Detection', () => {
  const guard = new DecompositionGuard();

  it('should detect and reject circular dependency cycles in TaskGraph', () => {
    const cyclicGraph: TaskGraph = {
      graphId: 'graph_cycle',
      taskId: 'task_cycle',
      version: 1,
      subtasks: [
        {
          subtaskId: 'sub_a',
          taskId: 'task_cycle',
          title: 'Subtask A',
          objective: 'Do A',
          type: 'ANALYSIS',
          status: 'READY',
          priority: 1,
          dependencies: ['sub_c'],
          prerequisites: [],
          successCriteria: [],
          requiredContext: [],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        },
        {
          subtaskId: 'sub_b',
          taskId: 'task_cycle',
          title: 'Subtask B',
          objective: 'Do B',
          type: 'DESIGN',
          status: 'PENDING',
          priority: 2,
          dependencies: ['sub_a'],
          prerequisites: [],
          successCriteria: [],
          requiredContext: [],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        },
        {
          subtaskId: 'sub_c',
          taskId: 'task_cycle',
          title: 'Subtask C',
          objective: 'Do C',
          type: 'IMPLEMENTATION',
          status: 'PENDING',
          priority: 3,
          dependencies: ['sub_b'],
          prerequisites: [],
          successCriteria: [],
          requiredContext: [],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        }
      ],
      dependencies: [
        { sourceSubtaskId: 'sub_a', targetSubtaskId: 'sub_b', type: 'HARD' },
        { sourceSubtaskId: 'sub_b', targetSubtaskId: 'sub_c', type: 'HARD' },
        { sourceSubtaskId: 'sub_c', targetSubtaskId: 'sub_a', type: 'HARD' } // Circular cycle A -> B -> C -> A
      ],
      confidence: 0.9,
      rationale: 'Cyclic graph test',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    expect(() => guard.validateGraph(cyclicGraph)).toThrow(DecompositionError);
  });
});
