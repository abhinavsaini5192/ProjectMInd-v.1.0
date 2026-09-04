import { describe, it, expect } from 'vitest';
import { ContextRequirementAnalyzer } from '../../../src/intelligence/decomposition/core/ContextRequirementAnalyzer';

describe('Context Requirement & Information Gaps', () => {
  const analyzer = new ContextRequirementAnalyzer();

  it('should infer requirements and detect blocking information gaps when symbols are unknown', () => {
    const subtask = {
      subtaskId: 'sub_auth_mod',
      taskId: 'task_1',
      title: 'Modify Auth Middleware',
      objective: 'Update token verification',
      type: 'IMPLEMENTATION' as const,
      status: 'READY' as const,
      priority: 1,
      dependencies: [],
      prerequisites: [],
      successCriteria: [],
      requiredContext: ['AuthService', 'JWT_SECRET_CONFIG'],
      estimatedComplexity: 'LOW' as const,
      risk: 'LOW' as const,
      createdAt: Date.now()
    };

    const knownSymbols = ['AuthService']; // JWT_SECRET_CONFIG is missing
    const { requirements, informationGaps } = analyzer.analyzeRequirements(subtask, knownSymbols);

    expect(requirements.length).toBe(2);
    expect(informationGaps.length).toBe(1);
    expect(informationGaps[0].gapId).toContain('JWT_SECRET_CONFIG');
    expect(informationGaps[0].blocking).toBe(true);
  });
});
