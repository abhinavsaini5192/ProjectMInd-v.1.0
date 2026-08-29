import { Memory, MemoryStatus } from '../models/Memory';
import { MemoryCandidate } from '../models/MemoryCandidate';
import { MemorySource } from '../models/MemorySource';

export class MemoryContradictionResolver {
  public resolve(candidate: MemoryCandidate, existingMemories: Memory[]): Memory[] {
    const updatedMemories: Memory[] = [];

    for (const mem of existingMemories) {
       // Mock logic: if the candidate explicitly contradicts an old memory
       if (candidate.content.startsWith('NOT ') && candidate.content.replace('NOT ', '') === mem.content) {
          
          if (candidate.source === MemorySource.SOURCE_CODE || candidate.source === MemorySource.TEST_RESULT) {
             // Authoritative ground truth overrides stale memory
             mem.status = MemoryStatus.SUPERSEDED;
             updatedMemories.push(mem);
          }
       }
    }

    return updatedMemories;
  }
}
