import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class EndpointImpactSource implements IImpactSource {
  public readonly name = 'ENDPOINT' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableApiPropagation) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const isEndpointChange =
        target.targetType === 'ENDPOINT' ||
        change.changeType === 'API_CHANGED' ||
        change.changeType === 'CONTRACT_CHANGED' ||
        (target.metadata && target.metadata.isEndpoint === true) ||
        (target.name && /^(GET|POST|PUT|DELETE|PATCH)\s+/i.test(target.name));

      if (!isEndpointChange) continue;

      // 1. Identify feature owning the endpoint
      let owningFeatureId = target.featureId;
      if (!owningFeatureId) {
        for (const m of context.mappings) {
          if (!m.active) continue;
          if (m.resourceType === 'ENDPOINT' && (m.resourceId === target.targetId || (target.name && m.resourceId.includes(target.name)))) {
            owningFeatureId = m.featureId;
            break;
          }
        }
      }

      if (owningFeatureId) {
        const directEvidence = ChangeSourceHelper.createEvidence({
          source: 'ENDPOINT',
          sourceId: target.targetId,
          evidenceType: 'ENDPOINT_OWNER_MODIFICATION',
          description: `API endpoint "${target.name || target.targetId}" contract changed on owning feature "${owningFeatureId}".`,
          confidence: 0.95,
        });

        candidates.push(
          ChangeSourceHelper.createCandidate({
            sourceChangeId: change.changeId,
            targetFeatureId: owningFeatureId,
            targetResourceId: target.targetId,
            targetResourceType: 'ENDPOINT',
            impactType: 'API',
            scope: 'FEATURE',
            direction: 'DOWNSTREAM',
            confidence: 'VERY_HIGH',
            severity: 'HIGH',
            direct: true,
            distance: 0,
            evidence: [directEvidence],
            contributingChanges: [target],
          })
        );

        // 2. Identify consumers of this endpoint / feature
        for (const rel of context.relationships) {
          if (!rel.active) continue;
          if (rel.targetFeatureId === owningFeatureId && ['CONSUMES', 'USES', 'DEPENDS_ON', 'INTEGRATES_WITH'].includes(rel.relationshipType)) {
            const consumerEvidence = ChangeSourceHelper.createEvidence({
              source: 'ENDPOINT',
              sourceId: rel.relationshipId,
              evidenceType: 'API_CONSUMER_IMPACT',
              description: `Feature "${rel.sourceFeatureId}" consumes API endpoint provided by "${owningFeatureId}".`,
              confidence: 0.9,
              metadata: {
                endpoint: target.name || target.targetId,
                producerFeatureId: owningFeatureId,
                consumerFeatureId: rel.sourceFeatureId,
              },
            });

            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: rel.sourceFeatureId,
                targetResourceId: target.targetId,
                targetResourceType: 'ENDPOINT',
                impactType: 'API',
                scope: 'FEATURE',
                direction: 'DOWNSTREAM',
                confidence: 'HIGH',
                severity: 'HIGH',
                direct: false,
                distance: 1,
                evidence: [consumerEvidence],
                contributingChanges: [target],
              })
            );
          }
        }
      }
    }

    return candidates;
  }
}
