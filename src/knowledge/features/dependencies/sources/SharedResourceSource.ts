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

export class SharedResourceSource implements IFeatureRelationshipSource {
  public readonly sourceType = 'SHARED_RESOURCE';
  public readonly name = 'SharedResourceSource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'SHARES_RESOURCE' || relationshipType === 'ASSOCIATED_WITH';
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
    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const [resourceId, featureSet] of resourceMap.entries()) {
      if (featureSet.size < 2) continue;

      const featureIds = Array.from(featureSet);
      for (let i = 0; i < featureIds.length; i++) {
        for (let j = i + 1; j < featureIds.length; j++) {
          const featA = featureIds[i]!;
          const featB = featureIds[j]!;
          if (featA === featB) continue;

          // Normalized alphabetical pair key to ensure single bidirectional candidate
          const [first, second] = featA < featB ? [featA, featB] : [featB, featA];
          const pairKey = `${first}:::${second}:::${resourceId}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const candidate: FeatureRelationshipCandidate = {
            candidateId: `cand_shared_${randomUUID().slice(0, 8)}`,
            sourceFeatureId: first,
            targetFeatureId: second,
            proposedType: 'SHARES_RESOURCE',
            direction: 'BIDIRECTIONAL',
            evidence: [
              {
                evidenceId: `ev_shared_${randomUUID().slice(0, 8)}`,
                sourceType: 'SHARED_RESOURCE',
                sourceId: resourceId,
                evidenceType: 'SHARED_RESOURCE_MAPPING',
                description: `Resource "${resourceId}" is mapped to both features "${first}" and "${second}"`,
                strength: 0.75,
                confidence: 0.75,
                metadata: {
                  resourceId,
                  sharedFeatures: [first, second],
                },
                timestamp: Date.now(),
              },
            ],
            score: 0.75,
            confidence: {
              level: scoreToFeatureRelationshipConfidenceLevel(0.75),
              score: 0.75,
              reasons: [`Shared resource "${resourceId}" serves both features`],
            },
            sources: ['SHARED_RESOURCE'],
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
