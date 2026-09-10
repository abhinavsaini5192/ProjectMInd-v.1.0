import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class TestImpactSource implements IImpactSource {
  public readonly name = 'TEST' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableVerificationPropagation) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const targetIds = [target.targetId];
      if (target.symbolName) targetIds.push(target.symbolName);
      if (target.filePath) targetIds.push(target.filePath);

      // 1. Check if the change itself is a test file
      const isTestChange =
        target.targetType === 'TEST' ||
        (target.filePath && /\.test\.|\.spec\.|__tests__/i.test(target.filePath)) ||
        (target.name && /\.test\.|\.spec\./i.test(target.name));

      if (isTestChange) {
        // Test change only produces VERIFICATION impact, NOT implementation impact
        const testEvidence = ChangeSourceHelper.createEvidence({
          source: 'TEST',
          sourceId: target.targetId,
          evidenceType: 'TEST_FILE_MODIFIED',
          description: `Test resource "${target.name || target.targetId}" was modified; verification suite updated.`,
          confidence: 0.98,
        });

        // Find owning feature of this test
        for (const m of context.mappings) {
          if (!m.active) continue;
          if (m.resourceId === target.targetId || (target.filePath && m.resourceId === target.filePath)) {
            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: m.featureId,
                targetResourceId: target.targetId,
                targetResourceType: 'TEST',
                impactType: 'VERIFICATION',
                scope: 'FEATURE',
                direction: 'DOWNSTREAM',
                confidence: 'VERY_HIGH',
                severity: 'INFO',
                direct: true,
                distance: 0,
                evidence: [testEvidence],
                contributingChanges: [target],
              })
            );
          }
        }
        continue;
      }

      // 2. Implementation change affecting tests
      // Find tests mapped to the affected feature or related to the changed symbol/file
      for (const m of context.mappings) {
        if (!m.active || m.resourceType !== 'TEST') continue;

        const isTestRelated =
          (target.name && m.resourceId.toLowerCase().includes(target.name.toLowerCase().replace(/\.[a-z]+$/, ''))) ||
          (target.filePath && m.resourceId.includes(target.filePath.replace(/^src\//, '').replace(/\.[a-z]+$/, ''))) ||
          (target.featureId && m.featureId === target.featureId);

        if (isTestRelated) {
          const verificationEvidence = ChangeSourceHelper.createEvidence({
            source: 'TEST',
            sourceId: m.mappingId,
            evidenceType: 'AFFECTED_VERIFICATION_TEST',
            description: `Verification test "${m.resourceId}" covers implementation resource "${target.name || target.targetId}" in feature "${m.featureId}".`,
            confidence: 0.9,
            metadata: {
              testResourceId: m.resourceId,
              requiresReview: true,
              claimFailure: false, // Explicitly not claiming the test will fail!
            },
          });

          // Resource level test impact
          candidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: change.changeId,
              targetFeatureId: m.featureId,
              targetResourceId: m.resourceId,
              targetResourceType: 'TEST',
              impactType: 'VERIFICATION',
              scope: 'RESOURCE',
              direction: 'DOWNSTREAM',
              confidence: 'HIGH',
              severity: 'LOW',
              direct: false,
              distance: 1,
              evidence: [verificationEvidence],
              contributingChanges: [target],
            })
          );
        }
      }
    }

    return candidates;
  }
}
