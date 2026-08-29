import { describe, it, expect } from 'vitest';
import { ContextScorer } from '../../../src/intelligence/context/ranking/ContextScorer';
import { RelevanceRanker } from '../../../src/intelligence/context/ranking/RelevanceRanker';
import { ContextPlanner } from '../../../src/intelligence/context/core/ContextPlanner';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';
import { ContextItem } from '../../../src/intelligence/context/models/ContextItem';

describe('Context Ranking & Scoring (Phase 5.3)', () => {
  const planner = new ContextPlanner();
  const plan = planner.plan('Fix AuthService timeout');
  const scorer = new ContextScorer();
  const ranker = new RelevanceRanker();

  const explicitItem: ContextItem = {
    id: 'item_1',
    type: ContextType.SYMBOL,
    content: 'Symbol: AuthService handles auth tokens',
    sources: [{
      sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
      sourceId: 'sym_auth',
      confidence: 1.0,
      timestamp: Date.now(),
      trustLevel: TrustLevel.VERIFIED_CODE_FACT
    }],
    relevance: 0.9,
    confidence: 1.0,
    priority: 1,
    tokenEstimate: 50
  };

  const genericItem: ContextItem = {
    id: 'item_2',
    type: ContextType.DOCUMENTATION,
    content: 'Generic documentation on project architecture',
    sources: [{
      sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
      sourceId: 'doc_1',
      confidence: 0.8,
      timestamp: Date.now() - 10000000,
      trustLevel: TrustLevel.HISTORICAL_INFORMATION
    }],
    relevance: 0.4,
    confidence: 0.8,
    priority: 4,
    tokenEstimate: 50
  };

  it('should assign higher score to explicitly referenced and verified items', () => {
    const score1 = scorer.calculateScore(explicitItem, plan);
    const score2 = scorer.calculateScore(genericItem, plan);

    expect(score1.finalScore).toBeGreaterThan(score2.finalScore);
    expect(score1.explicitMention).toBeGreaterThan(0);
    expect(score2.explicitMention).toBe(0);
  });

  it('RelevanceRanker should deterministically sort highest scored items first', () => {
    const ranked = ranker.rank([genericItem, explicitItem], plan);
    expect(ranked[0].id).toBe('item_1');
    expect(ranked[1].id).toBe('item_2');
  });
});
