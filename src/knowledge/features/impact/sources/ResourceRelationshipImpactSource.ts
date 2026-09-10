import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class ResourceRelationshipImpactSource implements IImpactSource {
  public readonly name = 'RESOURCE_RELATIONSHIP' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    for (const change of context.changes) {
      const target = change.target;

      // If symbol is changed, its containing file and related mapped resources are impacted at RESOURCE scope
      if (target.targetType === 'SYMBOL' && target.filePath) {
        const fileEvidence = ChangeSourceHelper.createEvidence({
          source: 'RESOURCE_RELATIONSHIP',
          sourceId: target.targetId,
          evidenceType: 'SYMBOL_TO_FILE_CONTAINMENT',
          description: `Symbol "${target.symbolName || target.targetId}" is contained within file "${target.filePath}".`,
          confidence: 0.95,
        });

        candidates.push(
          ChangeSourceHelper.createCandidate({
            sourceChangeId: change.changeId,
            targetResourceId: target.filePath,
            targetResourceType: 'FILE',
            impactType: 'RESOURCE',
            scope: 'FILE',
            direction: 'UPSTREAM',
            confidence: 'VERY_HIGH',
            severity: 'LOW',
            direct: true,
            distance: 0,
            evidence: [fileEvidence],
            contributingChanges: [target],
          })
        );
      }

      // Check for related resources in mappings that share the same file
      if (target.filePath) {
        for (const m of context.mappings) {
          if (!m.active) continue;
          if (m.resourceId !== target.targetId && m.resourceId.startsWith(target.filePath)) {
            const relEvidence = ChangeSourceHelper.createEvidence({
              source: 'RESOURCE_RELATIONSHIP',
              sourceId: m.mappingId,
              evidenceType: 'CO_LOCATED_RESOURCE',
              description: `Resource "${m.resourceId}" is co-located in "${target.filePath}".`,
              confidence: 0.7,
            });

            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: m.featureId,
                targetResourceId: m.resourceId,
                targetResourceType: m.resourceType,
                impactType: 'RESOURCE',
                scope: 'RESOURCE',
                direction: 'DOWNSTREAM',
                confidence: 'MEDIUM',
                severity: 'LOW',
                direct: false,
                distance: 1,
                evidence: [relEvidence],
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
