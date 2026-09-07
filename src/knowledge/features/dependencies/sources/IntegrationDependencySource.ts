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

export class IntegrationDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'INTEGRATION';
  public readonly name = 'IntegrationDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return (
      relationshipType === 'TRIGGERS' ||
      relationshipType === 'CONSUMES' ||
      relationshipType === 'INTEGRATES_WITH'
    );
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
    if (!context.integrationEvents || context.integrationEvents.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const evt of context.integrationEvents) {
      const pubFeatures = evt.publisherResourceId
        ? DependencySourceHelper.getFeaturesForResource(evt.publisherResourceId, resourceMap)
        : [];
      const conFeatures = evt.consumerResourceId
        ? DependencySourceHelper.getFeaturesForResource(evt.consumerResourceId, resourceMap)
        : [];

      for (const pubFeatId of pubFeatures) {
        for (const conFeatId of conFeatures) {
          if (pubFeatId === conFeatId) continue;

          // 1. Publisher TRIGGERS Consumer
          const trigKey = `${pubFeatId}:::${conFeatId}:::TRIGGERS:::${evt.eventName}`;
          if (!seenPairs.has(trigKey)) {
            seenPairs.add(trigKey);
            candidates.push({
              candidateId: `cand_int_trig_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: pubFeatId,
              targetFeatureId: conFeatId,
              proposedType: 'TRIGGERS',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_int_pub_${randomUUID().slice(0, 8)}`,
                  sourceType: 'INTEGRATION',
                  sourceId: evt.eventName,
                  evidenceType: 'EVENT_PUBLISH_TRIGGER',
                  description: `Feature "${pubFeatId}" emits event "${evt.eventName}" which triggers feature "${conFeatId}"`,
                  strength: 0.85,
                  confidence: 0.85,
                  metadata: {
                    event: evt.eventName,
                    publisher: evt.publisherResourceId,
                    consumer: evt.consumerResourceId,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.85,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.85),
                score: 0.85,
                reasons: [`Asynchronous event integration: emits ${evt.eventName}`],
              },
              sources: ['INTEGRATION'],
              conflicts: [],
              status: 'DETECTED',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }

          // 2. Consumer CONSUMES Publisher
          const consKey = `${conFeatId}:::${pubFeatId}:::CONSUMES:::${evt.eventName}`;
          if (!seenPairs.has(consKey)) {
            seenPairs.add(consKey);
            candidates.push({
              candidateId: `cand_int_con_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: conFeatId,
              targetFeatureId: pubFeatId,
              proposedType: 'CONSUMES',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_int_con_${randomUUID().slice(0, 8)}`,
                  sourceType: 'INTEGRATION',
                  sourceId: evt.eventName,
                  evidenceType: 'EVENT_SUBSCRIPTION_CONSUME',
                  description: `Feature "${conFeatId}" consumes event "${evt.eventName}" published by feature "${pubFeatId}"`,
                  strength: 0.85,
                  confidence: 0.85,
                  metadata: {
                    event: evt.eventName,
                    publisher: evt.publisherResourceId,
                    consumer: evt.consumerResourceId,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.85,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.85),
                score: 0.85,
                reasons: [`Event subscriber consumes ${evt.eventName} from ${pubFeatId}`],
              },
              sources: ['INTEGRATION'],
              conflicts: [],
              status: 'DETECTED',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }
    }

    return candidates;
  }
}
