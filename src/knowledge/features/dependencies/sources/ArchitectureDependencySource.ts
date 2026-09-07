import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type {
  IFeatureRelationshipSource,
  DependencyContext,
} from '../interfaces/IFeatureRelationshipSource';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';

export class ArchitectureDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'ARCHITECTURE';
  public readonly name = 'ArchitectureDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'PROVIDES' || relationshipType === 'DEPENDS_ON';
  }

  public discoverRelationships(
    feature: Feature,
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates = this.discoverCandidates(allFeatures, context);
    return candidates.filter((c) => c.sourceFeatureId === feature.id);
  }

  public discoverCandidates(
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates: FeatureRelationshipCandidate[] = [];
    if (!context.architectureCapabilities || context.architectureCapabilities.length === 0) {
      return candidates;
    }

    const platformFeatures = context.architectureCapabilities
      .filter((c) => c.layer === 'PLATFORM')
      .map((c) => c.featureId);
    const appFeatures = context.architectureCapabilities
      .filter((c) => c.layer === 'APPLICATION' || c.layer === 'DOMAIN')
      .map((c) => c.featureId);

    const seenPairs = new Set<string>();

    for (const platId of platformFeatures) {
      for (const appId of appFeatures) {
        if (platId === appId) continue;

        // 1. Application DEPENDS_ON Platform
        const depKey = `${appId}:::${platId}:::ARCH_DEPENDS_ON`;
        if (!seenPairs.has(depKey)) {
          seenPairs.add(depKey);
          candidates.push({
            candidateId: `cand_arch_dep_${randomUUID().slice(0, 8)}`,
            sourceFeatureId: appId,
            targetFeatureId: platId,
            proposedType: 'DEPENDS_ON',
            direction: 'DIRECTED',
            evidence: [
              {
                evidenceId: `ev_arch_dep_${randomUUID().slice(0, 8)}`,
                sourceType: 'ARCHITECTURE',
                sourceId: `${appId} -> ${platId}`,
                evidenceType: 'ARCHITECTURAL_LAYER_DEPENDENCY',
                description: `Application/Domain feature "${appId}" relies on platform-level architectural capability "${platId}"`,
                strength: 0.80,
                confidence: 0.80,
                metadata: {
                  platformFeature: platId,
                  appFeature: appId,
                },
                timestamp: Date.now(),
              },
            ],
            score: 0.80,
            confidence: {
              level: scoreToFeatureRelationshipConfidenceLevel(0.80),
              score: 0.80,
              reasons: [`Architectural layering: ${appId} relies on platform capability ${platId}`],
            },
            sources: ['ARCHITECTURE'],
            conflicts: [],
            status: 'DETECTED',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

        // 2. Platform PROVIDES to Application
        const provKey = `${platId}:::${appId}:::ARCH_PROVIDES`;
        if (!seenPairs.has(provKey)) {
          seenPairs.add(provKey);
          candidates.push({
            candidateId: `cand_arch_prov_${randomUUID().slice(0, 8)}`,
            sourceFeatureId: platId,
            targetFeatureId: appId,
            proposedType: 'PROVIDES',
            direction: 'DIRECTED',
            evidence: [
              {
                evidenceId: `ev_arch_prov_${randomUUID().slice(0, 8)}`,
                sourceType: 'ARCHITECTURE',
                sourceId: `${platId} -> ${appId}`,
                evidenceType: 'ARCHITECTURAL_LAYER_PROVISION',
                description: `Platform capability "${platId}" provides foundational service to "${appId}"`,
                strength: 0.80,
                confidence: 0.80,
                metadata: {
                  platformFeature: platId,
                  appFeature: appId,
                },
                timestamp: Date.now(),
              },
            ],
            score: 0.80,
            confidence: {
              level: scoreToFeatureRelationshipConfidenceLevel(0.80),
              score: 0.80,
              reasons: [`Platform capability ${platId} provides foundational service to ${appId}`],
            },
            sources: ['ARCHITECTURE'],
            conflicts: [],
            status: 'DETECTED',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    }

    return candidates;
  }
}
