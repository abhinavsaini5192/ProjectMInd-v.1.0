import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryEngine } from '../../../src/agent/memory/core/MemoryEngine';
import { IMemoryStore } from '../../../src/agent/memory/retrieval/IMemoryStore';
import { MemoryCandidate } from '../../../src/agent/memory/models/MemoryCandidate';
import { MemoryType } from '../../../src/agent/memory/models/MemoryType';
import { MemorySource } from '../../../src/agent/memory/models/MemorySource';
import { Memory, MemoryStatus } from '../../../src/agent/memory/models/Memory';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';

class MockMemoryStore implements IMemoryStore {
  private memories: Memory[] = [];

  async save(memory: Memory): Promise<void> {
    this.memories.push(memory);
  }
  async update(memory: Memory): Promise<void> {
    const idx = this.memories.findIndex(m => m.memoryId === memory.memoryId);
    if (idx !== -1) this.memories[idx] = memory;
  }
  async findById(memoryId: string): Promise<Memory | null> {
    return this.memories.find(m => m.memoryId === memoryId) || null;
  }
  async findSimilar(content: string, type: string): Promise<Memory[]> {
    return this.memories;
  }
  async findBySymbol(symbol: string): Promise<Memory[]> {
    return this.memories;
  }
  async findByFeature(feature: string): Promise<Memory[]> {
    return this.memories;
  }
  async findByTask(taskId: string): Promise<Memory[]> {
    return this.memories;
  }
  async findAllActive(): Promise<Memory[]> {
    return this.memories.filter(m => m.status === MemoryStatus.ACTIVE);
  }
}

describe('Agent Memory & Learning Feedback Engine (Phase 4.9)', () => {
  let store: MockMemoryStore;
  let engine: MemoryEngine;

  beforeEach(() => {
    store = new MockMemoryStore();
    engine = new MemoryEngine(store, new KernelEventDispatcher());
  });

  const createCandidate = (content: string, type: MemoryType, source: MemorySource, confidence: 'HIGH' | 'MEDIUM' | 'LOW'): MemoryCandidate => ({
    type, content, confidence, importance: 'MEDIUM', source, evidence: [{ source, description: 'Test evidence' }], relatedSymbols: [], relatedFeatures: [], relatedTasks: []
  });

  it('should reject candidates with empty content or missing evidence', async () => {
    const candidate1 = createCandidate('', MemoryType.EPISODIC, MemorySource.TASK_EXECUTION, 'MEDIUM');
    const result1 = await engine.promoteCandidate(candidate1);
    expect(result1).toBeNull();

    const candidate2 = createCandidate('Valid content', MemoryType.EPISODIC, MemorySource.TASK_EXECUTION, 'MEDIUM');
    candidate2.evidence = []; // Missing evidence
    const result2 = await engine.promoteCandidate(candidate2);
    expect(result2).toBeNull();
  });

  it('should reject HIGH confidence SLM_INFERENCE candidates', async () => {
    const candidate = createCandidate('I guess this works', MemoryType.SEMANTIC, MemorySource.SLM_INFERENCE, 'HIGH');
    const result = await engine.promoteCandidate(candidate);
    expect(result).toBeNull();
  });

  it('should deduplicate equivalent memories by bumping observationCount', async () => {
    const candidate1 = createCandidate('AuthService requires token', MemoryType.PROCEDURAL, MemorySource.TASK_EXECUTION, 'MEDIUM');
    const mem1 = await engine.promoteCandidate(candidate1);
    expect(mem1).toBeDefined();
    expect(mem1!.observationCount).toBe(1);

    const candidate2 = createCandidate('AuthService requires token', MemoryType.PROCEDURAL, MemorySource.TEST_RESULT, 'HIGH');
    const mem2 = await engine.promoteCandidate(candidate2);
    expect(mem2).toBeDefined();
    
    // Should be the exact same memory instance updated
    expect(mem2!.memoryId).toBe(mem1!.memoryId);
    expect(mem2!.observationCount).toBe(2);
    expect(mem2!.confidence).toBe('HIGH'); // Confidence should upgrade
  });

  it('should resolve contradictions by superseding stale memories in favor of ground truth', async () => {
    // 1. Initial memory (e.g. from an old test)
    const oldCandidate = createCandidate('Uses Redux', MemoryType.SEMANTIC, MemorySource.TASK_EXECUTION, 'MEDIUM');
    const oldMem = await engine.promoteCandidate(oldCandidate);

    // 2. New memory that contradicts it, derived from SOURCE_CODE (ground truth)
    const newCandidate = createCandidate('NOT Uses Redux', MemoryType.SEMANTIC, MemorySource.SOURCE_CODE, 'HIGH');
    const newMem = await engine.promoteCandidate(newCandidate);

    expect(newMem).toBeDefined();
    expect(newMem!.memoryId).not.toBe(oldMem!.memoryId);

    // Check old memory status in store
    const retrievedOldMem = await store.findById(oldMem!.memoryId);
    expect(retrievedOldMem!.status).toBe(MemoryStatus.SUPERSEDED);
  });
});
