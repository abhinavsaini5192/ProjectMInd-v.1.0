import { randomUUID } from 'crypto';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { FeatureReference } from '../../models/FeatureReference';
import { FeatureType } from '../../models/FeatureType';

export class FeatureCandidateGenerator {
  /**
   * Group raw evidence into candidate capability clusters
   */
  public generateCandidates(evidenceList: DiscoveryEvidence[], context: DiscoveryContext): FeatureCandidate[] {
    const clusterMap = new Map<string, DiscoveryEvidence[]>();

    for (const evidence of evidenceList) {
      const cap = evidence.targetCapability.trim();
      if (!clusterMap.has(cap)) {
        clusterMap.set(cap, []);
      }
      clusterMap.get(cap)!.push(evidence);
    }

    const candidates: FeatureCandidate[] = [];
    const now = Date.now();

    for (const [capabilityName, evidences] of clusterMap.entries()) {
      const candidateId = `fc_${randomUUID().slice(0, 8)}`;
      const sources = Array.from(new Set(evidences.map((e) => e.sourceType)));
      const references: FeatureReference[] = [];

      for (const ev of evidences) {
        ev.candidateId = candidateId;
        if (ev.resourceReference) {
          references.push(ev.resourceReference);
        }
      }

      // Deduplicate references by resourceId
      const uniqueRefs = Array.from(new Map(references.map((r) => [r.resourceId, r])).values());

      candidates.push({
        candidateId,
        proposedName: capabilityName,
        proposedDescription: `Discovered capability representing ${capabilityName} within repository ${context.repositoryId}`,
        type: this.inferFeatureType(capabilityName),
        scope: {
          workspaceId: context.workspaceId,
          repositoryId: context.repositoryId,
        },
        evidence: evidences,
        score: 0.5,
        confidence: {
          level: 'MEDIUM',
          score: 0.5,
          reasons: [`Initial candidate generated with ${evidences.length} evidence items across ${sources.length} sources`],
        },
        sources,
        references: uniqueRefs,
        conflicts: [],
        status: 'DETECTED',
        createdAt: now,
        updatedAt: now,
      });
    }

    return candidates;
  }

  private inferFeatureType(name: string): FeatureType {
    const lower = name.toLowerCase();
    if (lower.includes('auth') || lower.includes('payment') || lower.includes('user') || lower.includes('order')) {
      return FeatureType.USER_FACING;
    }
    if (lower.includes('notify') || lower.includes('email') || lower.includes('analytics')) {
      return FeatureType.PLATFORM;
    }
    return FeatureType.SYSTEM;
  }
}
