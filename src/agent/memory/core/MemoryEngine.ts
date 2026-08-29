import { MemoryCandidate } from '../models/MemoryCandidate';
import { Memory, MemoryStatus } from '../models/Memory';
import { IMemoryStore } from '../retrieval/IMemoryStore';
import { MemoryValidator } from './MemoryValidator';
import { MemoryDeduplicator } from '../logic/MemoryDeduplicator';
import { MemoryContradictionResolver } from '../logic/MemoryContradictionResolver';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class MemoryEngine {
  private validator = new MemoryValidator();
  private deduplicator = new MemoryDeduplicator();
  private resolver = new MemoryContradictionResolver();

  constructor(private store: IMemoryStore, private dispatcher: KernelEventDispatcher) {}

  public async promoteCandidate(candidate: MemoryCandidate): Promise<Memory | null> {
    if (!this.validator.validate(candidate)) {
       return null;
    }

    this.dispatcher.publish('MEMORY_VALIDATED', { type: candidate.type });

    const allActive = await this.store.findAllActive();
    
    // 1. Deduplicate
    const duplicate = this.deduplicator.deduplicate(candidate, allActive);
    if (duplicate) {
       await this.store.update(duplicate);
       this.dispatcher.publish('MEMORY_DEDUPLICATED', { memoryId: duplicate.memoryId });
       return duplicate;
    }

    // 2. Resolve Contradictions
    const supersededMemories = this.resolver.resolve(candidate, allActive);
    for (const oldMem of supersededMemories) {
       await this.store.update(oldMem);
       this.dispatcher.publish('MEMORY_SUPERSEDED', { memoryId: oldMem.memoryId });
    }

    // 3. Promote to new Memory
    const newMemory: Memory = {
       memoryId: `mem_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
       repositoryId: 'repo_1',
       workspaceId: 'workspace_1',
       type: candidate.type,
       content: candidate.content,
       status: MemoryStatus.ACTIVE,
       confidence: candidate.confidence,
       importance: candidate.importance,
       createdAt: Date.now(),
       updatedAt: Date.now(),
       lastConfirmedAt: Date.now(),
       observationCount: 1,
       source: candidate.source,
       evidence: candidate.evidence,
       relatedSymbols: candidate.relatedSymbols,
       relatedFeatures: candidate.relatedFeatures,
       relatedTasks: candidate.relatedTasks
    };

    await this.store.save(newMemory);
    this.dispatcher.publish('MEMORY_PROMOTED', { memoryId: newMemory.memoryId });

    return newMemory;
  }
}
