import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Architectural Boundary Tests (Phase 5.3)', () => {
  const promptBuilderPath = path.resolve(__dirname, '../../../src/intelligence/context/prompts/PromptBuilder.ts');
  const contextAssemblerPath = path.resolve(__dirname, '../../../src/intelligence/context/core/ContextAssembler.ts');
  const contextEnginePath = path.resolve(__dirname, '../../../src/intelligence/context/core/ContextEngine.ts');

  it('PromptBuilder must not import fs or child_process or access disk', () => {
    const content = fs.readFileSync(promptBuilderPath, 'utf8');
    expect(content).not.toContain("import * as fs");
    expect(content).not.toContain("import fs from 'fs'");
    expect(content).not.toContain("child_process");
    expect(content).not.toContain("readFileSync");
  });

  it('ContextAssembler must not perform raw repository filesystem scans', () => {
    const content = fs.readFileSync(contextAssemblerPath, 'utf8');
    expect(content).not.toContain("import * as fs");
    expect(content).not.toContain("readdirSync");
    expect(content).not.toContain("child_process");
  });

  it('ContextEngine must operate through retriever abstractions', () => {
    const content = fs.readFileSync(contextEnginePath, 'utf8');
    expect(content).not.toContain("sqlite");
    expect(content).not.toContain("child_process");
  });
});
