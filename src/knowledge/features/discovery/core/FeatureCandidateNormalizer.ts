import type { FeatureCandidate } from '../models/FeatureCandidate';
import { CapabilityNameInferer } from '../sources/CapabilityNameInferer';

export interface EquivalenceSignal {
  primaryCandidateId: string;
  secondaryCandidateId: string;
  primaryName: string;
  secondaryName: string;
  similarityScore: number;
  reason: string;
}

export class FeatureCandidateNormalizer {
  /**
   * Normalize candidate names and produce equivalence signals for potential consolidation
   */
  public normalize(candidates: FeatureCandidate[]): { normalized: FeatureCandidate[]; equivalenceSignals: EquivalenceSignal[] } {
    const equivalenceSignals: EquivalenceSignal[] = [];
    const nameMap = new Map<string, FeatureCandidate>();

    for (const candidate of candidates) {
      const canonicalName = CapabilityNameInferer.infer(candidate.proposedName) || candidate.proposedName;
      candidate.proposedName = canonicalName;

      const existing = nameMap.get(canonicalName.toLowerCase());
      if (existing) {
        // Record equivalence signal
        equivalenceSignals.push({
          primaryCandidateId: existing.candidateId,
          secondaryCandidateId: candidate.candidateId,
          primaryName: existing.proposedName,
          secondaryName: candidate.proposedName,
          similarityScore: 1.0,
          reason: `Exact canonical name match: "${canonicalName}"`,
        });

        // Merge evidence and references into primary candidate
        existing.evidence.push(...candidate.evidence);
        existing.sources = Array.from(new Set([...existing.sources, ...candidate.sources]));
        const refMap = new Map(existing.references.map((r) => [r.resourceId, r]));
        for (const r of candidate.references) {
          refMap.set(r.resourceId, r);
        }
        existing.references = Array.from(refMap.values());
        existing.updatedAt = Date.now();
      } else {
        nameMap.set(canonicalName.toLowerCase(), candidate);
      }
    }

    // Check for near-equivalents (e.g. "User Management" and "User Profile Management")
    const consolidated = Array.from(nameMap.values());
    for (let i = 0; i < consolidated.length; i++) {
      for (let j = i + 1; j < consolidated.length; j++) {
        const c1 = consolidated[i];
        const c2 = consolidated[j];
        if (!c1 || !c2) continue;
        const overlap = this.calculateReferenceOverlap(c1, c2);
        if (overlap > 0.4) {
          equivalenceSignals.push({
            primaryCandidateId: c1.candidateId,
            secondaryCandidateId: c2.candidateId,
            primaryName: c1.proposedName,
            secondaryName: c2.proposedName,
            similarityScore: overlap,
            reason: `High reference resource overlap (${Math.round(overlap * 100)}%)`,
          });
        }
      }
    }

    return {
      normalized: consolidated,
      equivalenceSignals,
    };
  }

  private calculateReferenceOverlap(c1: FeatureCandidate, c2: FeatureCandidate): number {
    if (c1.references.length === 0 || c2.references.length === 0) return 0;
    const set1 = new Set(c1.references.map((r) => r.resourceId));
    let common = 0;
    for (const r of c2.references) {
      if (set1.has(r.resourceId)) {
        common++;
      }
    }
    return (2 * common) / (c1.references.length + c2.references.length);
  }
}
