import { randomUUID } from 'crypto';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import type { FeatureDependencyConflict } from '../models/FeatureDependencyConflict';
import type { IFeatureRelationshipResolver, ResolutionResult } from '../interfaces/IFeatureRelationshipResolver';
import type { FeatureRelationshipEvidence } from '../models/FeatureRelationshipEvidence';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';

const TYPE_PRIORITY: Record<FeatureRelationshipType, number> = {
  DEPENDS_ON: 100,
  USES: 90,
  CONSUMES: 85,
  PROVIDES: 80,
  INTEGRATES_WITH: 75,
  TRIGGERS: 70,
  SHARES_RESOURCE: 65,
  SHARES_DATA: 60,
  COORDINATES: 55,
  EXTENDS: 50,
  SPECIALIZES: 45,
  COMPOSES: 40,
  AUTHORIZES: 35,
  FEEDS: 30,
  OBSERVES: 25,
  VERIFIES: 20,
  REQUIRED_BY: 15,
  ASSOCIATED_WITH: 10,
};

export class FeatureRelationshipResolver implements IFeatureRelationshipResolver {
  public resolve(
    candidates: FeatureRelationshipCandidate[],
    existingRelationships: FeatureRelationship[] = []
  ): ResolutionResult {
    const conflicts: FeatureDependencyConflict[] = [];
    const resolvedRelationships: FeatureRelationship[] = [];

    // 1. Group candidates by directed edge: `${source}::${target}`
    const candidateGroups = new Map<string, FeatureRelationshipCandidate[]>();
    for (const candidate of candidates) {
      const key = `${candidate.sourceFeatureId}::${candidate.targetFeatureId}`;
      const group = candidateGroups.get(key) || [];
      group.push(candidate);
      candidateGroups.set(key, group);
    }

    // 2. Map existing relationships for fast lookup
    const existingByKey = new Map<string, FeatureRelationship>();
    for (const rel of existingRelationships) {
      existingByKey.set(`${rel.sourceFeatureId}::${rel.targetFeatureId}`, rel);
    }

    // 3. Process each candidate group
    for (const [key, group] of candidateGroups.entries()) {
      const parts = key.split('::');
      const sourceId = parts[0];
      const targetId = parts[1];
      if (!sourceId || !targetId || group.length === 0) continue;

      const firstCand = group[0]!;

      // Aggregate evidence
      const combinedEvidence: FeatureRelationshipEvidence[] = [];
      const seenEvidenceKeys = new Set<string>();
      const sourcesSet = new Set<string>();

      for (const cand of group) {
        for (const src of cand.sources) {
          sourcesSet.add(src);
        }
        for (const ev of cand.evidence) {
          const loc = (ev.metadata?.location as string | undefined) || (ev.metadata?.filePath as string | undefined) || ev.sourceId;
          const evKey = `${ev.sourceType}::${ev.description}::${loc}`;
          if (!seenEvidenceKeys.has(evKey)) {
            seenEvidenceKeys.add(evKey);
            combinedEvidence.push(ev);
          }
        }
      }

      // Check for type contention among candidates on the same edge
      const typesScoreMap = new Map<FeatureRelationshipType, number>();
      for (const cand of group) {
        const current = typesScoreMap.get(cand.proposedType) || 0;
        typesScoreMap.set(cand.proposedType, current + cand.score);
      }

      // If opposing types are proposed (e.g. PROVIDES and CONSUMES), flag conflict
      if (typesScoreMap.has('PROVIDES') && typesScoreMap.has('CONSUMES')) {
        conflicts.push({
          conflictId: `conf_${randomUUID()}`,
          sourceFeatureId: sourceId,
          targetFeatureId: targetId,
          relationships: [],
          reason: `Contradictory relationship types proposed: PROVIDES and CONSUMES between ${sourceId} and ${targetId}`,
          severity: 'WARNING',
          evidence: combinedEvidence,
          status: 'OPEN',
          createdAt: Date.now(),
        });
      }

      // Select dominant relationship type
      let dominantType = firstCand.proposedType;
      let highestScore = -1;

      for (const [type, score] of typesScoreMap.entries()) {
        const priority = TYPE_PRIORITY[type] || 0;
        const weightedScore = score * 1000 + priority;
        if (weightedScore > highestScore) {
          highestScore = weightedScore;
          dominantType = type;
        }
      }

      // Compute aggregate score
      const maxScore = Math.max(...group.map((c) => c.score), 0);
      const avgScore = group.reduce((acc, c) => acc + c.score, 0) / group.length;
      // Multi-evidence boost
      const diversityBonus = sourcesSet.size >= 2 ? 0.1 : 0;
      const finalScore = Math.min(1.0, Math.max(0.1, Math.round((Math.max(maxScore, avgScore) + diversityBonus) * 100) / 100));

      const confidence = {
        level: scoreToFeatureRelationshipConfidenceLevel(finalScore),
        score: finalScore,
        reasons: Array.from(sourcesSet).map((s) => `Inferred from source provider: ${s}`),
      };

      // Check existing relationship
      const existing = existingByKey.get(key);
      const now = Date.now();

      if (existing) {
        if (existing.source === 'MANUAL') {
          // STRICT PROTECTION: Preserve manual relationship type, direction, and source
          const mergedEvidence = [...existing.evidence];
          const existingEvKeys = new Set(
            existing.evidence.map((e) => {
              const loc = (e.metadata?.location as string | undefined) || (e.metadata?.filePath as string | undefined) || e.sourceId;
              return `${e.sourceType}::${e.description}::${loc}`;
            })
          );

          for (const ev of combinedEvidence) {
            const loc = (ev.metadata?.location as string | undefined) || (ev.metadata?.filePath as string | undefined) || ev.sourceId;
            const evKey = `${ev.sourceType}::${ev.description}::${loc}`;
            if (!existingEvKeys.has(evKey)) {
              existingEvKeys.add(evKey);
              mergedEvidence.push(ev);
            }
          }

          resolvedRelationships.push({
            ...existing,
            evidence: mergedEvidence,
            relationshipVersion: existing.relationshipVersion + 1,
            updatedAt: now,
            active: true,
          });
        } else {
          // Automated relationship update
          resolvedRelationships.push({
            ...existing,
            relationshipType: dominantType,
            direction: firstCand.direction || 'DIRECTED',
            confidence,
            score: finalScore,
            evidence: combinedEvidence,
            updatedAt: now,
            relationshipVersion: existing.relationshipVersion + 1,
            active: true,
          });
        }
      } else {
        // Create new relationship
        resolvedRelationships.push({
          relationshipId: `rel_${randomUUID()}`,
          sourceFeatureId: sourceId,
          targetFeatureId: targetId,
          relationshipType: dominantType,
          direction: firstCand.direction || 'DIRECTED',
          confidence,
          score: finalScore,
          evidence: combinedEvidence,
          source: 'DISCOVERED',
          scope: {
            workspaceId: 'default',
            repositoryId: 'default',
          },
          createdAt: now,
          updatedAt: now,
          knowledgeVersion: '2.0.0',
          relationshipVersion: 1,
          active: true,
        });
      }
    }

    // 4. Check for direct reciprocal hard conflicts (A DEPENDS_ON B and B DEPENDS_ON A)
    const relByKey = new Map<string, FeatureRelationship>();
    for (const rel of resolvedRelationships) {
      relByKey.set(`${rel.sourceFeatureId}::${rel.targetFeatureId}`, rel);
    }

    for (const rel of resolvedRelationships) {
      const reciprocalKey = `${rel.targetFeatureId}::${rel.sourceFeatureId}`;
      const reciprocal = relByKey.get(reciprocalKey);
      if (reciprocal && rel.relationshipType === 'DEPENDS_ON' && reciprocal.relationshipType === 'DEPENDS_ON') {
        // Check if already registered conflict
        const alreadyFlagged = conflicts.some(
          (c) =>
            (c.sourceFeatureId === rel.sourceFeatureId && c.targetFeatureId === rel.targetFeatureId) ||
            (c.sourceFeatureId === rel.targetFeatureId && c.targetFeatureId === rel.sourceFeatureId)
        );
        if (!alreadyFlagged) {
          conflicts.push({
            conflictId: `conf_${randomUUID()}`,
            sourceFeatureId: rel.sourceFeatureId,
            targetFeatureId: rel.targetFeatureId,
            relationships: [rel, reciprocal],
            reason: `Direct circular dependency conflict: ${rel.sourceFeatureId} and ${rel.targetFeatureId} depend on each other.`,
            severity: 'CRITICAL',
            evidence: [...rel.evidence, ...reciprocal.evidence],
            status: 'OPEN',
            createdAt: Date.now(),
          });
        }
      }
    }

    return {
      resolvedRelationships,
      conflicts,
    };
  }
}
