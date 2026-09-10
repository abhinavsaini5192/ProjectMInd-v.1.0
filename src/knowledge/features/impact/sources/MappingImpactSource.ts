import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class MappingImpactSource implements IImpactSource {
  public readonly name = 'MAPPING' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    for (const change of context.changes) {
      const target = change.target;

      // 1. Direct feature change
      if (target.targetType === 'FEATURE' || target.featureId) {
        const featureId = target.featureId || target.targetId;
        const evidence = ChangeSourceHelper.createEvidence({
          source: 'MAPPING',
          sourceId: target.targetId,
          evidenceType: 'DIRECT_FEATURE_TARGET',
          description: `Feature ${featureId} was directly targeted for change (${change.changeType}).`,
          confidence: 0.98,
        });

        candidates.push(
          ChangeSourceHelper.createCandidate({
            sourceChangeId: change.changeId,
            targetFeatureId: featureId,
            impactType: 'DIRECT',
            scope: 'FEATURE',
            confidence: 'VERY_HIGH',
            severity: change.changeType === 'DELETED' ? 'HIGH' : 'MEDIUM',
            direct: true,
            distance: 0,
            evidence: [evidence],
            contributingChanges: [target],
          })
        );
      }

      // 2. Resource mapping to feature
      const targetIds = [target.targetId];
      if (target.symbolName) targetIds.push(target.symbolName);
      if (target.filePath) targetIds.push(target.filePath);

      for (const mapping of context.mappings) {
        if (!mapping.active) continue;

        const matches =
          targetIds.includes(mapping.resourceId) ||
          (target.name && mapping.resourceId.includes(target.name)) ||
          (target.filePath && mapping.resourceId === target.filePath) ||
          (target.symbolName && mapping.resourceId.includes(target.symbolName));

        if (matches) {
          // Documentation boundary (Section 19): Never generate implementation impact on features
          if (
            mapping.resourceType === 'DOCUMENTATION' ||
            mapping.role === 'DOCUMENTATION' ||
            (target.filePath && target.filePath.endsWith('.md')) ||
            target.targetId.endsWith('.md')
          ) {
            continue;
          }

          const evidence = ChangeSourceHelper.createEvidence({
            source: 'MAPPING',
            sourceId: mapping.mappingId,
            evidenceType: 'RESOURCE_FEATURE_MAPPING',
            description: `Changed resource "${target.name || target.targetId}" maps to feature "${mapping.featureId}" (role: ${mapping.role}).`,
            confidence: mapping.score ? mapping.score / 100 : 0.95,
            metadata: {
              resourceType: mapping.resourceType,
              role: mapping.role,
            },
          });

          candidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: change.changeId,
              targetFeatureId: mapping.featureId,
              targetResourceId: mapping.resourceId,
              targetResourceType: mapping.resourceType,
              impactType: 'DIRECT',
              scope: 'FEATURE',
              confidence: 'VERY_HIGH',
              severity: mapping.role === 'ENTRY_POINT' || mapping.role === 'IMPLEMENTATION' ? 'HIGH' : 'MEDIUM',
              direct: true,
              distance: 0,
              evidence: [evidence],
              contributingChanges: [target],
            })
          );
        }
      }
    }

    return candidates;
  }
}
