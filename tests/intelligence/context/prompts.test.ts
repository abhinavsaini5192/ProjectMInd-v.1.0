import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../../../src/intelligence/context/prompts/PromptBuilder';
import { SystemPromptBuilder } from '../../../src/intelligence/context/prompts/SystemPromptBuilder';
import { TaskPromptBuilder } from '../../../src/intelligence/context/prompts/TaskPromptBuilder';
import { ContextPromptBuilder } from '../../../src/intelligence/context/prompts/ContextPromptBuilder';
import { ContextPackage } from '../../../src/intelligence/context/models/ContextPackage';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Prompt Engineering (Phase 5.3)', () => {
  const samplePackage: ContextPackage = {
    packageId: 'pkg_test_123',
    planId: 'plan_test_123',
    taskId: 'Fix session timeout',
    summary: 'Context summary',
    items: [],
    sections: [{
      title: 'Symbol Context',
      type: ContextType.SYMBOL,
      items: [{
        id: 'sym_1',
        type: ContextType.SYMBOL,
        content: 'AuthService handles session tokens',
        sources: [{
          sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
          sourceId: 'sym_auth',
          confidence: 1.0,
          timestamp: Date.now(),
          trustLevel: TrustLevel.VERIFIED_CODE_FACT
        }],
        relevance: 1.0,
        confidence: 1.0,
        priority: 1,
        tokenEstimate: 30
      }]
    }],
    conflicts: [],
    tokenEstimate: 150,
    budget: {
      modelContextWindow: 8192,
      systemPromptReservation: 1000,
      taskPromptReservation: 500,
      outputReservation: 2048,
      safetyMargin: 200,
      availableContextBudget: 4444
    },
    generatedAt: Date.now()
  };

  it('SystemPromptBuilder should output JSON output instructions and operating principles', () => {
    const builder = new SystemPromptBuilder();
    const prompt = builder.buildSystemPrompt();
    expect(prompt).toContain('ProjectMind Brain');
    expect(prompt).toContain('OUTPUT SCHEMA');
    expect(prompt).toContain('decisionType');
  });

  it('TaskPromptBuilder should format task objective and constraints', () => {
    const builder = new TaskPromptBuilder();
    const prompt = builder.buildTaskPrompt('Fix session timeout', ['Do not modify DB schema']);
    expect(prompt).toContain('Objective: Fix session timeout');
    expect(prompt).toContain('Do not modify DB schema');
  });

  it('ContextPromptBuilder should structure sections with trust and provenance tags', () => {
    const builder = new ContextPromptBuilder();
    const prompt = builder.buildContextPrompt(samplePackage);
    expect(prompt).toContain('<PROJECT_CONTEXT>');
    expect(prompt).toContain('<SYMBOL>');
    expect(prompt).toContain('[Trust: VERIFIED_CODE_FACT | Source: sym_auth]');
    expect(prompt).toContain('AuthService handles session tokens');
    expect(prompt).toContain('</SYMBOL>');
    expect(prompt).toContain('</PROJECT_CONTEXT>');
  });

  it('PromptBuilder should combine builders into an SLMRequest with prompt trace', () => {
    const builder = new PromptBuilder();
    const { request, trace } = builder.buildPrompt('Fix session timeout', samplePackage, 'mock-model');

    expect(request.model).toBe('mock-model');
    expect(request.systemInstructions).toBeDefined();
    expect(request.userInput).toContain('Objective: Fix session timeout');
    expect(request.userInput).toContain('<PROJECT_CONTEXT>');
    expect(trace.promptVersion).toBe('1.0');
    expect(trace.contextPackageId).toBe('pkg_test_123');
  });
});
