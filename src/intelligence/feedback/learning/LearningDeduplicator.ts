import { LearningCandidate } from '../models/LearningCandidate';

export class LearningDeduplicator {
  public deduplicate(
    newCandidates: LearningCandidate[],
    existingCandidates: LearningCandidate[]
  ): { unique: LearningCandidate[]; duplicates: LearningCandidate[] } {
    const unique: LearningCandidate[] = [];
    const duplicates: LearningCandidate[] = [];

    const existingContents = new Set(existingCandidates.map(c => c.content.toLowerCase().trim()));

    for (const cand of newCandidates) {
      const normalized = cand.content.toLowerCase().trim();
      if (existingContents.has(normalized)) {
        duplicates.push(cand);
      } else {
        existingContents.add(normalized);
        unique.push(cand);
      }
    }

    return { unique, duplicates };
  }
}
