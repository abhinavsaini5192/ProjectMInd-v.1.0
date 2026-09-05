import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import type { FeatureReference } from '../../models/FeatureReference';

export class FeatureEvidenceAggregator {
  /**
   * Aggregate and deduplicate evidence across candidate sources
   */
  public aggregate(candidate: FeatureCandidate, additionalEvidence: DiscoveryEvidence[] = []): FeatureCandidate {
    const allEvidence = [...candidate.evidence, ...additionalEvidence];
    const dedupeMap = new Map<string, DiscoveryEvidence>();

    for (const ev of allEvidence) {
      const key = `${ev.sourceType}:${ev.sourceId}:${ev.evidenceType}`;
      if (!dedupeMap.has(key)) {
        dedupeMap.set(key, ev);
      } else {
        // Keep evidence with highest confidence
        const existing = dedupeMap.get(key)!;
        if (ev.confidence > existing.confidence) {
          dedupeMap.set(key, ev);
        }
      }
    }

    const aggregatedEvidence = Array.from(dedupeMap.values());
    const sources = Array.from(new Set(aggregatedEvidence.map((e) => e.sourceType)));

    // Recompute unique references
    const refMap = new Map<string, FeatureReference>();
    for (const ref of candidate.references) {
      refMap.set(ref.resourceId, ref);
    }
    for (const ev of aggregatedEvidence) {
      if (ev.resourceReference) {
        refMap.set(ev.resourceReference.resourceId, ev.resourceReference);
      }
    }

    candidate.evidence = aggregatedEvidence;
    candidate.sources = sources;
    candidate.references = Array.from(refMap.values());
    candidate.updatedAt = Date.now();

    return candidate;
  }
}
