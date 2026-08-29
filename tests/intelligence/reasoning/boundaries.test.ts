import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Architectural Boundary Tests (Phase 5.4)', () => {
  const enginePath = path.resolve(__dirname, '../../../src/intelligence/reasoning/core/StructuredReasoningEngine.ts');
  const pipelinePath = path.resolve(__dirname, '../../../src/intelligence/reasoning/core/ReasoningPipeline.ts');
  const validatorPath = path.resolve(__dirname, '../../../src/intelligence/reasoning/validation/ReasoningValidator.ts');

  it('StructuredReasoningEngine must not import fs or child_process or modify repository', () => {
    const content = fs.readFileSync(enginePath, 'utf8');
    expect(content).not.toContain("import * as fs");
    expect(content).not.toContain("child_process");
    expect(content).not.toContain("writeFileSync");
    expect(content).not.toContain("exec(");
  });

  it('ReasoningPipeline must not execute shell commands or file operations', () => {
    const content = fs.readFileSync(pipelinePath, 'utf8');
    expect(content).not.toContain("child_process");
    expect(content).not.toContain("exec(");
    expect(content).not.toContain("spawn(");
  });

  it('ReasoningValidator must not access disk or external services directly', () => {
    const content = fs.readFileSync(validatorPath, 'utf8');
    expect(content).not.toContain("fetch(");
    expect(content).not.toContain("sqlite");
    expect(content).not.toContain("child_process");
  });
});
