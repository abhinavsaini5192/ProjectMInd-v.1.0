import { describe, it, expect } from 'vitest';
import { DecompositionEngine } from '../../../src/intelligence/decomposition/core/DecompositionEngine';

describe('Decomposition & Context Engine Integration', () => {
  const engine = new DecompositionEngine();

  it('should decompose task, prepare context, and explain selection', async () => {
    const graph = engine.decomposeTask('task_jwt_1', 'Add JWT authentication');
    expect(graph.subtasks.length).toBeGreaterThan(0);

    const sub1 = graph.subtasks[0];
    const selection = await engine.prepareSubtaskContext(sub1.subtaskId, sub1.title, sub1.requiredContext);

    expect(selection.selectedCandidates.length).toBeGreaterThan(0);
    expect(selection.totalTokens).toBeLessThan(8000);

    const explanation = engine.explainContextSelection(selection);
    expect(explanation.selectedCount).toBe(selection.selectedCandidates.length);
    expect(explanation.selected[0].why).toBeDefined();
  });
});
