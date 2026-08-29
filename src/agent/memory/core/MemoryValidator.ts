import { MemoryCandidate } from '../models/MemoryCandidate';
import { MemorySource } from '../models/MemorySource';

export class MemoryValidator {
  public validate(candidate: MemoryCandidate): boolean {
    if (!candidate.content || candidate.content.trim() === '') {
       return false;
    }

    if (!candidate.evidence || candidate.evidence.length === 0) {
       return false; // Memories require strict provenance
    }

    if (candidate.source === MemorySource.SLM_INFERENCE && candidate.confidence === 'HIGH') {
       return false; // SLM cannot autonomously inject high-confidence memory without verification
    }

    return true;
  }
}
