import { describe, it, expect } from 'vitest';
import { ContextPlanner } from '../../../src/intelligence/context/core/ContextPlanner';
import { TaskProfile } from '../../../src/intelligence/context/models/ContextPlan';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';

describe('Context Planning (Phase 5.3)', () => {
  const planner = new ContextPlanner();

  it('should detect BUG_FIX task profile from intent keywords', () => {
    const plan = planner.plan('Fix the authentication timeout bug in AuthService.ts');
    expect(plan.taskType).toBe(TaskProfile.BUG_FIX);
    expect(plan.explicitReferences).toContain('AuthService.ts');
    expect(plan.explicitReferences).toContain('AuthService');
  });

  it('should detect CODE_REVIEW task profile from intent keywords', () => {
    const plan = planner.plan('Review the recent pull request changes');
    expect(plan.taskType).toBe(TaskProfile.CODE_REVIEW);
  });

  it('should allocate 75% of context window as context token budget', () => {
    const plan = planner.plan('Add new token validator', 16000);
    expect(plan.tokenBudget).toBe(12000);
  });

  it('should include required context types based on profile', () => {
    const plan = planner.plan('Fix crash in SessionManager.ts');
    const types = plan.requirements.map(r => r.type);
    expect(types).toContain(ContextType.SYMBOL);
    expect(types).toContain(ContextType.DEPENDENCY);
    expect(types).toContain(ContextType.FEATURE);
    expect(types).toContain(ContextType.MEMORY);
  });
});
