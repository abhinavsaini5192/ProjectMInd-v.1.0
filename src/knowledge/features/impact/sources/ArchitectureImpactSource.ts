import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';
import { FeatureType } from '../../models/FeatureType.js';

export class ArchitectureImpactSource implements IImpactSource {
  public readonly name = 'ARCHITECTURE' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableArchitecturePropagation) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const pathLower = (target.filePath || target.targetId).toLowerCase();

      // Check for core architectural layer indicators
      const isCoreOrPlatform =
        pathLower.includes('/core/') ||
        pathLower.includes('/platform/') ||
        pathLower.includes('/kernel/') ||
        pathLower.includes('/shared/');

      if (isCoreOrPlatform) {
        // Core/Platform changes have broad architectural impact on subsystem features
        for (const [featureId, feature] of context.features.entries()) {
          // If the feature is a USER_FACING or SYSTEM feature
          if (feature.type === FeatureType.USER_FACING || feature.type === FeatureType.SYSTEM) {
            const archEvidence = ChangeSourceHelper.createEvidence({
              source: 'ARCHITECTURE',
              sourceId: target.targetId,
              evidenceType: 'ARCHITECTURAL_FOUNDATION_CHANGE',
              description: `Architectural foundation component "${target.name || target.targetId}" changed, affecting architectural layer of feature "${featureId}".`,
              confidence: 0.8,
              metadata: {
                layer: 'FOUNDATION',
                featureType: feature.type,
              },
            });

            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: featureId,
                impactType: 'ARCHITECTURAL',
                scope: 'SUBSYSTEM',
                direction: 'DOWNSTREAM',
                confidence: 'MEDIUM',
                severity: 'MEDIUM',
                direct: false,
                distance: 2,
                evidence: [archEvidence],
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
