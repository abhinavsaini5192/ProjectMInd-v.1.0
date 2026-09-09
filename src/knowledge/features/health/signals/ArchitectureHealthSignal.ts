import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class ArchitectureHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'ArchitectureHealthSignal';
  public readonly signalType: HealthSignalType = 'LAYER_VIOLATION';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const mappings = context.mappings || [];
    const featureId = context.feature.featureId;

    const uiResources = mappings.filter((m) =>
      m.resourceType === 'UI_COMPONENT' || /views|components|ui|client|pages/i.test(m.resourceId)
    );
    const dbResources = mappings.filter((m) =>
      m.resourceType === 'DATABASE' || /model|entity|repository|db|migration|prisma/i.test(m.resourceId)
    );

    // Layer violation: Direct UI component imports or accesses database model without service/controller layer
    const hasServiceLayer = mappings.some((m) =>
      /service|usecase|handler|controller/i.test(m.resourceId)
    );

    if (uiResources.length > 0 && dbResources.length > 0 && !hasServiceLayer) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'LAYER_VIOLATION',
          severity: 'HIGH',
          value: 'UI_DIRECT_DB',
          normalizedValue: 80,
          description: `Layer violation: UI components directly interact with database entities without an intermediate service layer.`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'ARCHITECTURE_ANALYSIS',
              sourceId: featureId,
              evidenceType: 'MISSING_INTERMEDIARY_LAYER',
              description: `Feature contains ${uiResources.length} UI resources and ${dbResources.length} DB resources without a service layer.`,
              confidence: 0.88
            })
          ],
          source: this.id,
          confidence: 0.88
        })
      );
    }

    // Shared database table / resource collision across features
    if (context.allMappings && dbResources.length > 0) {
      for (const dbRes of dbResources) {
        const otherHolders = context.allMappings.filter(
          (m) => m.resourceId === dbRes.resourceId && m.featureId !== featureId
        );
        if (otherHolders.length > 0) {
          const otherFeatureIds = Array.from(new Set(otherHolders.map((m) => m.featureId)));
          signals.push(
            HealthSignalHelper.createSignal({
              featureId,
              signalType: 'SHARED_DATABASE_TABLE',
              severity: 'MEDIUM',
              value: dbRes.resourceId,
              normalizedValue: 65,
              description: `Database resource "${dbRes.resourceId}" is shared across multiple features (${otherFeatureIds.join(', ')}).`,
              evidence: [
                HealthSignalHelper.createEvidence({
                  sourceType: 'MAPPING_RESOURCE',
                  sourceId: dbRes.resourceId,
                  evidenceType: 'SHARED_RESOURCE_CONCURRENCY',
                  description: `Shared with features: ${otherFeatureIds.join(', ')}`,
                  confidence: 0.92
                })
              ],
              source: this.id,
              confidence: 0.92
            })
          );
        }
      }
    }

    // Check for bypassed abstraction flags in mapping metadata
    for (const m of mappings) {
      const meta = (m as unknown as { metadata?: Record<string, unknown> }).metadata || {};
      if (meta.bypassedAbstraction === true) {
        signals.push(
          HealthSignalHelper.createSignal({
            featureId,
            signalType: 'BYPASSED_ABSTRACTION',
            severity: 'MEDIUM',
            value: m.resourceId,
            normalizedValue: 70,
            description: `Resource "${m.resourceId}" bypasses established architectural abstraction interface.`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'ARCHITECTURE_ANALYSIS',
                sourceId: m.resourceId,
                evidenceType: 'BYPASSED_ABSTRACTION_FLAG',
                description: `Architectural abstraction bypass indicated in metadata.`,
                confidence: 0.9
              })
            ],
            source: this.id,
            confidence: 0.9
          })
        );
      }
    }

    return signals;
  }
}
