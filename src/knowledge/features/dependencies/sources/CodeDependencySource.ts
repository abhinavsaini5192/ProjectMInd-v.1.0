import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type {
  IFeatureRelationshipSource,
  DependencyContext,
} from '../interfaces/IFeatureRelationshipSource';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';
import { DependencySourceHelper } from './DependencySourceHelper';

export class CodeDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'CODE_DEPENDENCY';
  public readonly name = 'CodeDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return (
      relationshipType === 'DEPENDS_ON' ||
      relationshipType === 'USES' ||
      relationshipType === 'INTEGRATES_WITH'
    );
  }

  public discoverRelationships(
    feature: Feature,
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates = this.discoverCandidates(allFeatures, context);
    return candidates.filter(
      (c) => c.sourceFeatureId === feature.id || c.targetFeatureId === feature.id
    );
  }

  public discoverCandidates(
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates: FeatureRelationshipCandidate[] = [];
    if (!context.dependencies || context.dependencies.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const dep of context.dependencies) {
      const sourceRes = dep.sourceId || (dep as any).source;
      const targetRes = dep.targetId || (dep as any).target;
      if (!sourceRes || !targetRes) continue;

      // Filter out generic utility libraries (e.g. lodash, date-fns)
      if (DependencySourceHelper.isGenericLibrary(targetRes)) {
        continue;
      }

      const sourceFeatures = DependencySourceHelper.getFeaturesForResource(sourceRes, resourceMap);
      const targetFeatures = DependencySourceHelper.getFeaturesForResource(targetRes, resourceMap);

      for (const srcFeatId of sourceFeatures) {
        for (const tgtFeatId of targetFeatures) {
          if (srcFeatId === tgtFeatId) continue; // Reject self-dependency

          const pairKey = `${srcFeatId}:::${tgtFeatId}:::DEPENDS_ON`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const score = typeof (dep as any).confidence === 'number' ? (dep as any).confidence : 0.85;

          const candidate: FeatureRelationshipCandidate = {
            candidateId: `cand_code_${randomUUID().slice(0, 8)}`,
            sourceFeatureId: srcFeatId,
            targetFeatureId: tgtFeatId,
            proposedType: 'DEPENDS_ON',
            direction: 'DIRECTED',
            evidence: [
              {
                evidenceId: `ev_code_${randomUUID().slice(0, 8)}`,
                sourceType: 'CODE_DEPENDENCY',
                sourceId: `${sourceRes} -> ${targetRes}`,
                evidenceType: 'CODE_IMPORT_DEPENDENCY',
                description: `Code resource "${sourceRes}" in feature "${srcFeatId}" imports/depends on "${targetRes}" in feature "${tgtFeatId}"`,
                strength: score,
                confidence: score,
                metadata: {
                  sourceResource: sourceRes,
                  targetResource: targetRes,
                  type: dep.type,
                },
                timestamp: Date.now(),
              },
            ],
            score,
            confidence: {
              level: scoreToFeatureRelationshipConfidenceLevel(score),
              score,
              reasons: [`Code-level import/call between mapped feature resources (${sourceRes} -> ${targetRes})`],
            },
            sources: ['CODE_DEPENDENCY'],
            conflicts: [],
            status: 'DETECTED',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          candidates.push(candidate);
        }
      }
    }

    return candidates;
  }
}
