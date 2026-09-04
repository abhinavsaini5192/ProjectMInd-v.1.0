import { describe, it, expect } from 'vitest';
import { ContextBudgetGuard } from '../../../src/intelligence/decomposition/guards/ContextBudgetGuard';
import { ContextCandidate } from '../../../src/intelligence/decomposition/models/ContextCandidate';
import { ContextBudget } from '../../../src/intelligence/decomposition/models/ContextBudget';

describe('Context Budget Enforcement', () => {
  const guard = new ContextBudgetGuard();

  it('should enforce token budget and exclude low-ranking candidates when budget is exhausted', () => {
    const budget: ContextBudget = {
      maxTokens: 500,
      reservedTokens: 100,
      usedTokens: 100,
      remainingTokens: 400
    };

    const candidates: ContextCandidate[] = [
      {
        candidateId: 'c1',
        resourceId: 'AuthService',
        resourceType: 'SYMBOL',
        source: 'CODE_AST',
        content: 'class AuthService {}',
        relevance: { overallScore: 0.95, taskRelevance: 0.95, structuralRelevance: 1, dependencyRelevance: 1, semanticRelevance: 1, recencyRelevance: 1, confidenceScore: 1, whyIncluded: 'Target' },
        confidence: 0.95,
        dependencyDistance: 0,
        tokenCost: 200
      },
      {
        candidateId: 'c2',
        resourceId: 'AuthController',
        resourceType: 'SYMBOL',
        source: 'CODE_AST',
        content: 'class AuthController {}',
        relevance: { overallScore: 0.85, taskRelevance: 0.85, structuralRelevance: 0.8, dependencyRelevance: 0.9, semanticRelevance: 0.8, recencyRelevance: 1, confidenceScore: 1, whyIncluded: 'Caller' },
        confidence: 0.9,
        dependencyDistance: 1,
        tokenCost: 150
      },
      {
        candidateId: 'c3',
        resourceId: 'UnrelatedUtility',
        resourceType: 'FILE',
        source: 'CODE_AST',
        content: 'class UnrelatedUtility {}',
        relevance: { overallScore: 0.3, taskRelevance: 0.3, structuralRelevance: 0.2, dependencyRelevance: 0.1, semanticRelevance: 0.2, recencyRelevance: 0.5, confidenceScore: 0.8, whyIncluded: 'Low relevance' },
        confidence: 0.8,
        dependencyDistance: 5,
        tokenCost: 200 // Would exceed 500 tokens limit (100 reserved + 200 + 150 + 200 = 650 > 500)
      }
    ];

    const result = guard.enforceBudget(candidates, budget);
    expect(result.selected.length).toBe(2);
    expect(result.selected.map(s => s.resourceId)).toEqual(['AuthService', 'AuthController']);
    expect(result.excluded.length).toBe(1);
    expect(result.excluded[0].resourceId).toBe('UnrelatedUtility');
    expect(result.usedTokens).toBe(450);
  });
});
