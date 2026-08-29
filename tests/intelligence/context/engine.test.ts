import { describe, it, expect } from 'vitest';
import { ContextEngine } from '../../../src/intelligence/context/core/ContextEngine';
import { TaskProfile } from '../../../src/intelligence/context/models/ContextPlan';

describe('ContextEngine End-to-End (Phase 5.3)', () => {
  const engine = new ContextEngine();

  it('should assemble a complete structured ContextPackage for a task', async () => {
    const pkg = await engine.buildContext('Fix the login timeout bug in AuthService.ts', 16000, TaskProfile.BUG_FIX);

    expect(pkg.packageId).toBeDefined();
    expect(pkg.items.length).toBeGreaterThan(0);
    expect(pkg.sections.length).toBeGreaterThan(0);
    expect(pkg.tokenEstimate).toBeGreaterThan(0);
    expect(pkg.tokenEstimate).toBeLessThanOrEqual(pkg.budget.availableContextBudget);
  });
});
