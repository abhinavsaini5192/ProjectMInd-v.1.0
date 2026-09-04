import { describe, it, expect } from 'vitest';
import { RelevanceScorer } from '../../../src/intelligence/decomposition/ranking/RelevanceScorer';

describe('Multi-Factor Context Relevance Ranking', () => {
  const scorer = new RelevanceScorer();

  it('should rank structurally close targets higher than distant unrelated files', () => {
    const directTarget = scorer.scoreCandidate(
      { resourceId: 'AuthService', source: 'CODE_AST', dependencyDistance: 0 },
      ['auth', 'login'],
      ['AuthService']
    );

    const indirectTarget = scorer.scoreCandidate(
      { resourceId: 'PaymentLogger', source: 'CODE_AST', dependencyDistance: 6 },
      ['auth', 'login'],
      ['AuthService']
    );

    expect(directTarget.overallScore).toBeGreaterThan(indirectTarget.overallScore);
    expect(directTarget.structuralRelevance).toBe(1.0);
    expect(directTarget.whyIncluded).toContain('Direct structural match');
  });
});
