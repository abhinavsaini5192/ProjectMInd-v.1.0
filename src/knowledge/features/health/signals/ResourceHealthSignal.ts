import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class ResourceHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'ResourceHealthSignal';
  public readonly signalType: HealthSignalType = 'SINGLE_POINT_OF_FAILURE';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const featureId = context.feature.featureId;
    const mappings = context.mappings || [];

    // Single point of failure: exactly 1 file/service handles all logic for a multi-endpoint or high-importance feature
    const codeMappings = mappings.filter((m) => m.resourceType === 'FILE' || m.resourceType === 'MODULE');
    const endpointMappings = mappings.filter((m) => m.resourceType === 'ENDPOINT');

    if (codeMappings.length === 1 && endpointMappings.length >= 3) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'SINGLE_POINT_OF_FAILURE',
          severity: 'HIGH',
          value: codeMappings[0].resourceId,
          normalizedValue: 75,
          description: `Single point of failure: All ${endpointMappings.length} endpoints concentrate into single code resource "${codeMappings[0].resourceId}".`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'RESOURCE_AUDIT',
              sourceId: codeMappings[0].resourceId,
              evidenceType: 'CONCENTRATED_RESPONSIBILITY',
              description: `Single implementation resource backs entire feature surface.`,
              confidence: 0.9
            })
          ],
          source: this.id,
          confidence: 0.9
        })
      );
    }

    // Orphan feature component: mapped resource has no inbound dependencies, no endpoints, and is disconnected
    for (const mapping of mappings) {
      const meta = (mapping as unknown as { metadata?: Record<string, unknown> }).metadata || {};
      if (meta.isOrphaned === true) {
        signals.push(
          HealthSignalHelper.createSignal({
            featureId,
            signalType: 'ORPHAN_FEATURE_COMPONENT',
            severity: 'LOW',
            value: mapping.resourceId,
            normalizedValue: 40,
            description: `Resource "${mapping.resourceId}" appears orphaned or unreferenced by feature execution paths.`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'RESOURCE_AUDIT',
                sourceId: mapping.resourceId,
                evidenceType: 'ORPHAN_RESOURCE_FLAG',
                description: `Resource marked orphaned in metadata.`,
                confidence: 0.85
              })
            ],
            source: this.id,
            confidence: 0.85
          })
        );
      }
    }

    return signals;
  }
}
