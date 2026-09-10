import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class DataImpactSource implements IImpactSource {
  public readonly name = 'DATA' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableDataPropagation) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const isDataChange =
        target.targetType === 'DATABASE' ||
        target.targetType === 'DATABASE_ENTITY' ||
        change.changeType === 'DATA_SCHEMA_CHANGED' ||
        (target.metadata && target.metadata.isDatabaseEntity === true) ||
        (target.name && /table|schema|entity|model|migration/i.test(target.name));

      if (!isDataChange) continue;

      const entityName = target.name || target.symbolName || target.targetId;

      // Match features that explicitly reference this specific entity/table (NOT generic database)
      for (const m of context.mappings) {
        if (!m.active) continue;

        // Ensure we do NOT infer impact solely because two features use generic 'DATABASE'
        if (m.resourceType === 'DATABASE' && !m.resourceId.includes(entityName)) {
          continue;
        }

        const isEntityMatch =
          m.resourceId === target.targetId ||
          (m.resourceType === 'DATABASE_ENTITY' && (m.resourceId.includes(entityName) || entityName.includes(m.resourceId))) ||
          (m.role === 'STORAGE' && m.resourceId.includes(entityName)) ||
          (m.resourceId.toLowerCase().includes(entityName.toLowerCase().replace(/table|schema|entity/g, '')));

        if (isEntityMatch) {
          const evidence = ChangeSourceHelper.createEvidence({
            source: 'DATA',
            sourceId: m.mappingId,
            evidenceType: 'DATA_SCHEMA_ENTITY_MAPPING',
            description: `Feature "${m.featureId}" directly maps to changed data entity "${entityName}" (resource: ${m.resourceId}).`,
            confidence: 0.92,
            metadata: {
              entityName,
              resourceId: m.resourceId,
              role: m.role,
            },
          });

          candidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: change.changeId,
              targetFeatureId: m.featureId,
              targetResourceId: m.resourceId,
              targetResourceType: 'DATABASE_ENTITY',
              impactType: 'DATA',
              scope: 'FEATURE',
              direction: 'DOWNSTREAM',
              confidence: 'HIGH',
              severity: 'HIGH',
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
