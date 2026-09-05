import { randomUUID } from 'crypto';
import type { IFeatureMappingResolver, ResolutionResult } from '../interfaces/IFeatureMappingResolver';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingConflict } from '../models/MappingConflict';
import type { MappingRole } from '../models/MappingRole';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';

export class FeatureMappingResolver implements IFeatureMappingResolver {
  private static readonly ROLE_PRIORITY: Record<string, number> = {
    ENTRY_POINT: 10,
    IMPLEMENTATION: 9,
    API: 8,
    STORAGE: 7,
    CONFIGURATION: 6,
    TEST: 5,
    VERIFICATION: 5,
    UI: 4,
    COMMAND: 4,
    INTEGRATION: 4,
    ORCHESTRATION: 3,
    SUPPORT: 2,
    DOCUMENTATION: 1,
    OBSERVABILITY: 1,
    INFRASTRUCTURE: 1,
    DEPENDENCY: 1,
  };

  public resolve(
    candidates: MappingCandidate[],
    existingMappings: FeatureResourceMapping[] = []
  ): ResolutionResult {
    const conflicts: MappingConflict[] = [];
    const resolvedMappings: FeatureResourceMapping[] = [];

    // Group candidates by (featureId + ':::' + resourceId)
    const grouped = new Map<string, MappingCandidate[]>();
    for (const cand of candidates) {
      if (cand.status === 'REJECTED') continue;
      const key = `${cand.featureId}:::${cand.resourceId}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(cand);
    }

    // Index existing mappings by key
    const existingMap = new Map<string, FeatureResourceMapping>();
    for (const m of existingMappings) {
      existingMap.set(`${m.featureId}:::${m.resourceId}`, m);
    }

    for (const [key, cands] of grouped.entries()) {
      const [featureId, resourceId] = key.split(':::');
      const existing = existingMap.get(key);

      // Aggregate evidence
      const evidenceMap = new Map<string, any>();
      const allSources = new Set<any>();

      if (existing && existing.evidence) {
        for (const ev of existing.evidence) {
          evidenceMap.set(ev.evidenceId, ev);
        }
      }

      for (const cand of cands) {
        for (const ev of cand.evidence) {
          evidenceMap.set(ev.evidenceId, ev);
        }
        for (const src of cand.sources) {
          allSources.add(src);
        }
      }

      const allEvidence = Array.from(evidenceMap.values());

      // Determine dominant role
      let dominantRole: MappingRole = cands[0]!.proposedRole;
      let maxPriority = FeatureMappingResolver.ROLE_PRIORITY[dominantRole] || 0;

      for (const cand of cands) {
        const priority = FeatureMappingResolver.ROLE_PRIORITY[cand.proposedRole] || 0;
        if (priority > maxPriority) {
          maxPriority = priority;
          dominantRole = cand.proposedRole;
        }
      }

      // Aggregate score (take highest or blended score)
      const maxScore = Math.max(...cands.map((c) => c.score), existing ? existing.score : 0);
      const level = scoreToMappingConfidenceLevel(maxScore);

      // MANUAL MAPPING PROTECTION:
      if (existing && existing.source === 'MANUAL') {
        // Preserve manual mapping ID, role, and source
        const updatedManualMapping: FeatureResourceMapping = {
          ...existing,
          evidence: allEvidence,
          score: Math.max(existing.score, maxScore),
          confidence: {
            level: scoreToMappingConfidenceLevel(Math.max(existing.score, maxScore)),
            score: Math.max(existing.score, maxScore),
            reasons: [...existing.confidence.reasons, 'Enriched with automated discovery evidence'],
          },
          updatedAt: Date.now(),
          mappingVersion: existing.mappingVersion + 1,
        };
        resolvedMappings.push(updatedManualMapping);
        continue;
      }

      // If existing discovered mapping, update it
      if (existing) {
        const updatedMapping: FeatureResourceMapping = {
          ...existing,
          role: dominantRole,
          evidence: allEvidence,
          score: maxScore,
          confidence: {
            level,
            score: maxScore,
            reasons: allEvidence.map((e) => e.description).slice(0, 5),
          },
          updatedAt: Date.now(),
          mappingVersion: existing.mappingVersion + 1,
          active: true,
        };
        resolvedMappings.push(updatedMapping);
      } else {
        // Create new mapping
        const newMapping: FeatureResourceMapping = {
          mappingId: `map_${randomUUID().slice(0, 10)}`,
          featureId: featureId!,
          resourceId: resourceId!,
          resourceType: cands[0]!.resourceType,
          role: dominantRole,
          confidence: {
            level,
            score: maxScore,
            reasons: allEvidence.map((e) => e.description).slice(0, 5),
          },
          score: maxScore,
          evidence: allEvidence,
          source: 'DISCOVERED',
          scope: { workspaceId: 'default', repositoryId: 'default' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          knowledgeVersion: '1.0.0',
          mappingVersion: 1,
          active: true,
        };
        resolvedMappings.push(newMapping);
      }
    }

    return { resolvedMappings, conflicts };
  }
}
