import { describe, it, expect } from 'vitest';
import { KnowledgeRetriever } from '../../../src/intelligence/context/retrieval/KnowledgeRetriever';
import { MemoryRetriever } from '../../../src/intelligence/context/retrieval/MemoryRetriever';
import { DependencyRetriever } from '../../../src/intelligence/context/retrieval/DependencyRetriever';
import { FeatureRetriever } from '../../../src/intelligence/context/retrieval/FeatureRetriever';
import { ChangeRetriever } from '../../../src/intelligence/context/retrieval/ChangeRetriever';
import { ContextPlanner } from '../../../src/intelligence/context/core/ContextPlanner';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Context Retrieval Adapters (Phase 5.3)', () => {
  const planner = new ContextPlanner();
  const plan = planner.plan('Fix AuthService.ts timeout');

  it('KnowledgeRetriever should retrieve symbol and architecture items', async () => {
    const retriever = new KnowledgeRetriever();
    const req = plan.requirements.find(r => r.type === ContextType.SYMBOL)!;
    
    expect(retriever.canHandle(req)).toBe(true);
    const items = await retriever.retrieve(req, plan);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe(ContextType.SYMBOL);
    expect(items[0]!.sources[0]!.trustLevel).toBe(TrustLevel.VERIFIED_CODE_FACT);
  });

  it('MemoryRetriever should retrieve stored memory items', async () => {
    const retriever = new MemoryRetriever();
    const req = plan.requirements.find(r => r.type === ContextType.MEMORY)!;
    
    expect(retriever.canHandle(req)).toBe(true);
    const items = await retriever.retrieve(req, plan);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe(ContextType.MEMORY);
    expect(items[0]!.sources[0]!.trustLevel).toBe(TrustLevel.STORED_MEMORY);
  });

  it('DependencyRetriever should retrieve dependency chains with bounded expansion', async () => {
    const retriever = new DependencyRetriever();
    const req = plan.requirements.find(r => r.type === ContextType.DEPENDENCY)!;
    
    expect(retriever.canHandle(req)).toBe(true);
    const items = await retriever.retrieve(req, plan);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe(ContextType.DEPENDENCY);
    expect(items[0]!.content).toContain('Dependency Chain:');
  });

  it('FeatureRetriever should retrieve feature boundary context', async () => {
    const retriever = new FeatureRetriever();
    const req = plan.requirements.find(r => r.type === ContextType.FEATURE)!;
    
    expect(retriever.canHandle(req)).toBe(true);
    const items = await retriever.retrieve(req, plan);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe(ContextType.FEATURE);
  });

  it('ChangeRetriever should retrieve recent commit context', async () => {
    const retriever = new ChangeRetriever();
    const req = plan.requirements.find(r => r.type === ContextType.RECENT_CHANGE)!;
    
    expect(retriever.canHandle(req)).toBe(true);
    const items = await retriever.retrieve(req, plan);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.type).toBe(ContextType.RECENT_CHANGE);
  });
});
