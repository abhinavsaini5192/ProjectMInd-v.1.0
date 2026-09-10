import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class IntegrationImpactSource implements IImpactSource {
  public readonly name = 'INTEGRATION' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableIntegrationPropagation) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const isIntegrationTarget =
        (target.name && /adapter|client|provider|gateway|webhook|sdk|external/i.test(target.name)) ||
        (target.filePath && /integration|external|adapters|gateways/i.test(target.filePath)) ||
        (target.metadata && target.metadata.isExternalIntegration === true);

      if (!isIntegrationTarget) continue;

      // Find features that map to this integration component or have INTEGRATES_WITH relationships
      for (const m of context.mappings) {
        if (!m.active) continue;
        if (
          m.resourceId === target.targetId ||
          (target.name && m.resourceId.includes(target.name)) ||
          (target.filePath && m.resourceId === target.filePath)
        ) {
          const directEvidence = ChangeSourceHelper.createEvidence({
            source: 'INTEGRATION',
            sourceId: m.mappingId,
            evidenceType: 'EXTERNAL_INTEGRATION_BOUNDARY_MODIFICATION',
            description: `External integration adapter "${target.name || target.targetId}" changed in feature "${m.featureId}".`,
            confidence: 0.9,
            metadata: {
              component: target.name || target.targetId,
              isExternalBoundary: true,
            },
          });

          candidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: change.changeId,
              targetFeatureId: m.featureId,
              targetResourceId: m.resourceId,
              targetResourceType: m.resourceType,
              impactType: 'INTEGRATION',
              scope: 'FEATURE',
              direction: 'DOWNSTREAM',
              confidence: 'HIGH',
              severity: 'HIGH',
              direct: true,
              distance: 0,
              evidence: [directEvidence],
              contributingChanges: [target],
            })
          );

          // Find features that integrate with or consume this feature
          for (const rel of context.relationships) {
            if (!rel.active) continue;
            if (rel.targetFeatureId === m.featureId && ['INTEGRATES_WITH', 'CONSUMES', 'DEPENDS_ON'].includes(rel.relationshipType)) {
              const downstreamEvidence = ChangeSourceHelper.createEvidence({
                source: 'INTEGRATION',
                sourceId: rel.relationshipId,
                evidenceType: 'DOWNSTREAM_INTEGRATION_CONSUMER',
                description: `Feature "${rel.sourceFeatureId}" integrates with external adapter provider "${m.featureId}".`,
                confidence: 0.85,
              });

              candidates.push(
                ChangeSourceHelper.createCandidate({
                  sourceChangeId: change.changeId,
                  targetFeatureId: rel.sourceFeatureId,
                  impactType: 'INTEGRATION',
                  scope: 'FEATURE',
                  direction: 'DOWNSTREAM',
                  confidence: 'HIGH',
                  severity: 'HIGH',
                  direct: false,
                  distance: 1,
                  evidence: [downstreamEvidence],
                  contributingChanges: [target],
                })
              );
            }
          }
        }
      }
    }

    return candidates;
  }
}
