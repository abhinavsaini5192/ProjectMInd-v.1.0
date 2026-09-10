import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class DependencyImpactSource implements IImpactSource {
  public readonly name = 'DEPENDENCY' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    // Find all directly affected features from changes
    const directlyAffectedFeatureIds = new Set<string>();
    for (const change of context.changes) {
      if (change.target.featureId) {
        directlyAffectedFeatureIds.add(change.target.featureId);
      }
      if (change.target.targetType === 'FEATURE') {
        directlyAffectedFeatureIds.add(change.target.targetId);
      }
      for (const m of context.mappings) {
        if (!m.active) continue;
        if (
          m.resourceId === change.target.targetId ||
          (change.target.filePath && m.resourceId === change.target.filePath) ||
          (change.target.symbolName && m.resourceId.includes(change.target.symbolName))
        ) {
          directlyAffectedFeatureIds.add(m.featureId);
        }
      }
    }

    if (directlyAffectedFeatureIds.size === 0) {
      return candidates;
    }

    for (const change of context.changes) {
      for (const affectedFeatureId of directlyAffectedFeatureIds) {
        for (const rel of context.relationships) {
          if (!rel.active) continue;

          // Check if rel is allowed by configuration
          if (
            context.config.allowedRelationshipTypes &&
            !context.config.allowedRelationshipTypes.includes(rel.relationshipType)
          ) {
            continue;
          }

          let dependentFeatureId: string | undefined;
          let directionType = 'DEPENDS_ON';

          // If B depends on A (affectedFeatureId is A, targetFeatureId is A, sourceFeatureId is B)
          if (
            rel.targetFeatureId === affectedFeatureId &&
            ['DEPENDS_ON', 'CONSUMES', 'USES', 'REQUIRES', 'REQUIRED_BY'].includes(rel.relationshipType)
          ) {
            dependentFeatureId = rel.sourceFeatureId;
            directionType = rel.relationshipType;
          }
          // If A triggers or feeds B
          else if (
            rel.sourceFeatureId === affectedFeatureId &&
            ['TRIGGERS', 'FEEDS', 'PROVIDES', 'COORDINATES'].includes(rel.relationshipType)
          ) {
            dependentFeatureId = rel.targetFeatureId;
            directionType = rel.relationshipType;
          }

          if (dependentFeatureId && dependentFeatureId !== affectedFeatureId) {
            const evidence = ChangeSourceHelper.createEvidence({
              source: 'DEPENDENCY',
              sourceId: rel.relationshipId,
              evidenceType: 'FEATURE_DEPENDENCY',
              description: `Feature "${dependentFeatureId}" ${directionType} "${affectedFeatureId}", which is affected by change in "${change.target.name || change.target.targetId}".`,
              confidence: rel.score ? rel.score / 100 : 0.85,
              metadata: {
                sourceFeatureId: affectedFeatureId,
                targetFeatureId: dependentFeatureId,
                relationshipType: rel.relationshipType,
              },
            });

            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: dependentFeatureId,
                impactType: 'DEPENDENCY',
                scope: 'FEATURE',
                direction: 'DOWNSTREAM',
                confidence: 'HIGH',
                severity: 'MEDIUM',
                direct: false,
                distance: 1,
                evidence: [evidence],
                contributingChanges: [change.target],
              })
            );
          }
        }
      }
    }

    return candidates;
  }
}
