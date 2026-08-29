import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Architectural Boundary Tests (Phase 5.5)', () => {
  const coordinatorPath = path.resolve(__dirname, '../../../src/intelligence/planning/core/PlanningCoordinator.ts');
  const plannerPath = path.resolve(__dirname, '../../../src/intelligence/planning/core/ActionPlanner.ts');
  const decisionEnginePath = path.resolve(__dirname, '../../../src/intelligence/planning/core/DecisionEngine.ts');
  const validatorPath = path.resolve(__dirname, '../../../src/intelligence/planning/validation/PlanValidator.ts');

  it('PlanningCoordinator must not import fs or child_process or execute commands', () => {
    const content = fs.readFileSync(coordinatorPath, 'utf8');
    expect(content).not.toContain("import * as fs");
    expect(content).not.toContain("child_process");
    expect(content).not.toContain("exec(");
    expect(content).not.toContain("spawn(");
  });

  it('ActionPlanner must not modify files or mutate databases', () => {
    const content = fs.readFileSync(plannerPath, 'utf8');
    expect(content).not.toContain("writeFileSync");
    expect(content).not.toContain("sqlite");
  });

  it('DecisionEngine must not contain execution logic', () => {
    const content = fs.readFileSync(decisionEnginePath, 'utf8');
    expect(content).not.toContain("child_process");
    expect(content).not.toContain("fetch(");
  });

  it('PlanValidator must be pure validation without disk mutations', () => {
    const content = fs.readFileSync(validatorPath, 'utf8');
    expect(content).not.toContain("writeFileSync");
    expect(content).not.toContain("child_process");
  });
});
