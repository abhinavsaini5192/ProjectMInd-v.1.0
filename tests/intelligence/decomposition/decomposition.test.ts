import { describe, it, expect } from 'vitest';
import { TaskDecomposer } from '../../../src/intelligence/decomposition/core/TaskDecomposer';

describe('Task Decomposition (Phase 5.9)', () => {
  const decomposer = new TaskDecomposer();

  it('should adaptively decompose a trivial task into 1 subtask', () => {
    const graph = decomposer.decomposeTask('task_1', 'Rename variable foo to bar');
    expect(graph.subtasks.length).toBe(1);
    expect(graph.subtasks[0].type).toBe('IMPLEMENTATION');
    expect(graph.subtasks[0].estimatedComplexity).toBe('TRIVIAL');
  });

  it('should decompose a complex authentication task into structured subtasks with dependencies', () => {
    const graph = decomposer.decomposeTask('task_2', 'Add JWT authentication');
    expect(graph.subtasks.length).toBe(4);

    const titles = graph.subtasks.map(s => s.title);
    expect(titles[0]).toContain('Discover');
    expect(titles[1]).toContain('Design');
    expect(titles[2]).toContain('Implement');
    expect(titles[3]).toContain('Verify');

    expect(graph.dependencies.length).toBe(3);
    expect(graph.dependencies[0].sourceSubtaskId).toBe('task_2_sub_1');
    expect(graph.dependencies[0].targetSubtaskId).toBe('task_2_sub_2');
  });
});
