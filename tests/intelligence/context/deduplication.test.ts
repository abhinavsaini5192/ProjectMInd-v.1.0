import { describe, it, expect } from 'vitest';
import { ContextDeduplicator } from '../../../src/intelligence/context/ranking/ContextDeduplicator';
import { ContextItem } from '../../../src/intelligence/context/models/ContextItem';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Context Deduplication & Conflict Detection (Phase 5.3)', () => {
  const deduplicator = new ContextDeduplicator();

  it('should merge duplicate facts and combine their source provenances', () => {
    const item1: ContextItem = {
      id: 'item_1',
      type: ContextType.MEMORY,
      content: 'Authentication module uses JWT for sessions.',
      sources: [{
        sourceType: ContextSourceType.MEMORY,
        sourceId: 'mem_1',
        confidence: 0.8,
        timestamp: 1000,
        trustLevel: TrustLevel.STORED_MEMORY
      }],
      relevance: 0.8,
      confidence: 0.8,
      priority: 2,
      tokenEstimate: 30
    };

    const item2: ContextItem = {
      id: 'item_2',
      type: ContextType.ARCHITECTURE,
      content: 'Authentication module uses JWT for sessions.',
      sources: [{
        sourceType: ContextSourceType.ARCHITECTURE_ENGINE,
        sourceId: 'arch_1',
        confidence: 0.95,
        timestamp: 2000,
        trustLevel: TrustLevel.ANALYZED_ARCHITECTURE
      }],
      relevance: 0.9,
      confidence: 0.95,
      priority: 1,
      tokenEstimate: 30
    };

    const result = deduplicator.deduplicate([item1, item2]);
    expect(result.deduplicatedItems.length).toBe(1);
    expect(result.deduplicatedItems[0].sources.length).toBe(2);
    expect(result.deduplicatedItems[0].confidence).toBe(0.95);
    expect(result.deduplicatedItems[0].priority).toBe(1);
  });

  it('should detect conflicting assertions on the same entity', () => {
    const itemA: ContextItem = {
      id: 'item_a',
      type: ContextType.SYMBOL,
      content: 'SessionStore uses Redis backend',
      sources: [{
        sourceType: ContextSourceType.MEMORY,
        sourceId: 'mem_redis',
        confidence: 0.8,
        timestamp: 1000,
        trustLevel: TrustLevel.STORED_MEMORY
      }],
      relevance: 0.8,
      confidence: 0.8,
      priority: 2,
      tokenEstimate: 20,
      metadata: { entityName: 'SessionStore' }
    };

    const itemB: ContextItem = {
      id: 'item_b',
      type: ContextType.SYMBOL,
      content: 'SessionStore uses In-Memory Map backend',
      sources: [{
        sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
        sourceId: 'sym_memmap',
        confidence: 1.0,
        timestamp: 2000,
        trustLevel: TrustLevel.VERIFIED_CODE_FACT
      }],
      relevance: 0.9,
      confidence: 1.0,
      priority: 1,
      tokenEstimate: 20,
      metadata: { entityName: 'SessionStore' }
    };

    const result = deduplicator.deduplicate([itemA, itemB]);
    expect(result.conflicts.length).toBe(1);
    expect(result.conflicts[0].topic).toBe('SessionStore');
  });
});
