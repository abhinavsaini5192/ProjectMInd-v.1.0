import { describe, it, expect } from 'vitest';
import { BugFixReasoning } from '../../../src/intelligence/reasoning/strategies/BugFixReasoning';
import { CodeReviewReasoning } from '../../../src/intelligence/reasoning/strategies/CodeReviewReasoning';
import { ArchitectureReasoning } from '../../../src/intelligence/reasoning/strategies/ArchitectureReasoning';
import { PlanningReasoning } from '../../../src/intelligence/reasoning/strategies/PlanningReasoning';
import { ReasoningTaskType } from '../../../src/intelligence/reasoning/models/ReasoningTask';

describe('Reasoning Strategies (Phase 5.4)', () => {
  const bugFix = new BugFixReasoning();
  const codeReview = new CodeReviewReasoning();
  const archReasoning = new ArchitectureReasoning();
  const planningReasoning = new PlanningReasoning();

  it('BugFixReasoning should support BUG_ANALYSIS and format prompt', () => {
    expect(bugFix.supports(ReasoningTaskType.BUG_ANALYSIS)).toBe(true);
    expect(bugFix.supports(ReasoningTaskType.CODE_REVIEW)).toBe(false);
    const prompt = bugFix.buildStrategyPrompt({
      taskId: 't1',
      type: ReasoningTaskType.BUG_ANALYSIS,
      objective: 'Fix timeout',
      contextPackage: {} as any
    });
    expect(prompt).toContain('BUG ANALYSIS');
  });

  it('CodeReviewReasoning should support CODE_REVIEW', () => {
    expect(codeReview.supports(ReasoningTaskType.CODE_REVIEW)).toBe(true);
  });

  it('ArchitectureReasoning should support ARCHITECTURE_ANALYSIS', () => {
    expect(archReasoning.supports(ReasoningTaskType.ARCHITECTURE_ANALYSIS)).toBe(true);
  });

  it('PlanningReasoning should support IMPLEMENTATION_PLANNING', () => {
    expect(planningReasoning.supports(ReasoningTaskType.IMPLEMENTATION_PLANNING)).toBe(true);
  });
});
