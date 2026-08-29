import { Memory, MemoryStatus } from '../models/Memory';
import { MemoryCandidate } from '../models/MemoryCandidate';

export class MemoryDeduplicator {
  public deduplicate(candidate: MemoryCandidate, existingMemories: Memory[]): Memory | null {
    // Basic similarity check. A real implementation would use embeddings or fuzzy matching.
    const duplicate = existingMemories.find(m => 
      m.type === candidate.type && 
      m.content.toLowerCase() === candidate.content.toLowerCase()
    );

    if (duplicate) {
       // Merge evidence and bump observation count
       duplicate.observationCount += 1;
       duplicate.lastConfirmedAt = Date.now();
       duplicate.evidence = [...duplicate.evidence, ...candidate.evidence];
       
       if (candidate.confidence === 'HIGH') {
          duplicate.confidence = 'HIGH';
       }

       return duplicate;
    }

    return null;
  }
}
