import { randomUUID } from 'crypto';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryConflict } from '../models/DiscoveryConflict';

export interface DuplicateReport {
  candidateAId: string;
  candidateBId: string;
  nameA: string;
  nameB: string;
  overlapScore: number;
  sharedResources: string[];
  recommendation: 'MERGE' | 'KEEP_SEPARATE' | 'HUMAN_REVIEW';
  reason: string;
}

export class FeatureDuplicateDetector {
  /**
   * Compare all candidates pairwise to identify duplicates and overlapping scopes
   */
  public detectDuplicates(candidates: FeatureCandidate[]): { reports: DuplicateReport[]; conflicts: DiscoveryConflict[] } {
    const reports: DuplicateReport[] = [];
    const conflicts: DiscoveryConflict[] = [];

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const c1 = candidates[i];
        const c2 = candidates[j];
        if (!c1 || !c2) continue;

        const shared = this.getSharedResourceIds(c1, c2);
        const nameSim = this.computeStringSimilarity(c1.proposedName, c2.proposedName);
        const totalResources = Math.max(1, Math.min(c1.references.length, c2.references.length));
        const resourceOverlap = shared.length / totalResources;

        const combinedOverlap = nameSim * 0.4 + resourceOverlap * 0.6;

        if (combinedOverlap >= 0.5 || shared.length > 2) {
          const recommendation = combinedOverlap >= 0.75 ? 'MERGE' : 'HUMAN_REVIEW';
          const reason = `Found ${shared.length} shared resources and ${Math.round(nameSim * 100)}% name similarity between "${c1.proposedName}" and "${c2.proposedName}"`;

          reports.push({
            candidateAId: c1.candidateId,
            candidateBId: c2.candidateId,
            nameA: c1.proposedName,
            nameB: c2.proposedName,
            overlapScore: combinedOverlap,
            sharedResources: shared,
            recommendation,
            reason,
          });

          const hasSharedEntryPoint = shared.some((resId) => {
            const r1 = c1.references.find((r) => r.resourceId === resId);
            const r2 = c2.references.find((r) => r.resourceId === resId);
            return r1?.role === 'ENTRY_POINT' || r2?.role === 'ENTRY_POINT';
          });

          if (combinedOverlap >= 0.75 || hasSharedEntryPoint || resourceOverlap >= 0.75) {
            const conflict: DiscoveryConflict = {
              conflictId: `conf_dup_${randomUUID().slice(0, 8)}`,
              candidateId: c1.candidateId,
              type: 'RESOURCE_COLLISION',
              description: `Potential duplicate with candidate "${c2.proposedName}" (${c2.candidateId}): ${shared.join(', ')}`,
              severity: 'WARNING',
              involvedResources: shared,
              competingCandidateIds: [c1.candidateId, c2.candidateId],
              resolved: false,
            };
            conflicts.push(conflict);
            c1.conflicts.push(conflict);
            c2.conflicts.push({ ...conflict, candidateId: c2.candidateId });
          }
        }

        // Scope mismatch check
        if (c1.scope.repositoryId !== c2.scope.repositoryId || c1.scope.workspaceId !== c2.scope.workspaceId) {
          if (c1.proposedName.toLowerCase() === c2.proposedName.toLowerCase() || shared.length > 0) {
            const scopeConflict: DiscoveryConflict = {
              conflictId: `conf_scope_${randomUUID().slice(0, 8)}`,
              candidateId: c1.candidateId,
              type: 'SCOPE_MISMATCH',
              description: `Scope mismatch between candidate "${c1.proposedName}" (${c1.scope.repositoryId}) and "${c2.proposedName}" (${c2.scope.repositoryId})`,
              severity: 'CRITICAL',
              involvedResources: shared,
              competingCandidateIds: [c1.candidateId, c2.candidateId],
              resolved: false,
            };
            conflicts.push(scopeConflict);
            c1.conflicts.push(scopeConflict);
            c2.conflicts.push({ ...scopeConflict, candidateId: c2.candidateId });
          }
        }
      }
    }

    return { reports, conflicts };
  }

  private getSharedResourceIds(c1: FeatureCandidate, c2: FeatureCandidate): string[] {
    const set1 = new Set(c1.references.map((r) => r.resourceId));
    return c2.references.map((r) => r.resourceId).filter((id) => set1.has(id));
  }

  private computeStringSimilarity(s1: string, s2: string): number {
    const a = s1.toLowerCase().trim();
    const b = s2.toLowerCase().trim();
    if (a === b) return 1.0;
    if (a.includes(b) || b.includes(a)) return 0.8;

    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    let common = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) common++;
    }
    return (2 * common) / (wordsA.size + wordsB.size);
  }
}
