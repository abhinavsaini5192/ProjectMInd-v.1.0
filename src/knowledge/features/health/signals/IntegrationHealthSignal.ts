import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class IntegrationHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'IntegrationHealthSignal';
  public readonly signalType: HealthSignalType = 'UNDOCUMENTED_API_ENDPOINT';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const featureId = context.feature.featureId;
    const mappings = context.mappings || [];

    const endpoints = mappings.filter(
      (m) => m.resourceType === 'ENDPOINT' || /endpoint|routes|controller|api/i.test(m.resourceId)
    );
    const hasDocumentation = mappings.some(
      (m) => m.resourceType === 'DOCUMENTATION' || /docs|readme|swagger|openapi/i.test(m.resourceId)
    );

    // Undocumented endpoints
    if (endpoints.length > 0 && !hasDocumentation) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'UNDOCUMENTED_API_ENDPOINT',
          severity: 'MEDIUM',
          value: endpoints.length,
          normalizedValue: 60,
          description: `Feature exposes ${endpoints.length} API endpoint(s) without corresponding documentation or OpenAPI schema.`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'API_INSPECTION',
              sourceId: featureId,
              evidenceType: 'MISSING_API_DOCS',
              description: `Endpoints mapped: ${endpoints.map((e) => e.resourceId).slice(0, 5).join(', ')}`,
              confidence: 0.9
            })
          ],
          source: this.id,
          confidence: 0.9
        })
      );
    }

    // Check integration resiliency metadata (timeouts, circuit breakers)
    for (const mapping of mappings) {
      const meta = (mapping as unknown as { metadata?: Record<string, unknown> }).metadata || {};
      const isExternalIntegration =
        meta.isExternalIntegration === true || /http|axios|fetch|client|gateway|stripe/i.test(mapping.resourceId);

      if (isExternalIntegration) {
        if (meta.hasTimeout === false) {
          signals.push(
            HealthSignalHelper.createSignal({
              featureId,
              signalType: 'MISSING_TIMEOUT_CONFIGURATION',
              severity: 'HIGH',
              value: mapping.resourceId,
              normalizedValue: 75,
              description: `External integration "${mapping.resourceId}" lacks explicit network timeout configuration.`,
              evidence: [
                HealthSignalHelper.createEvidence({
                  sourceType: 'INTEGRATION_RESOURCE',
                  sourceId: mapping.resourceId,
                  evidenceType: 'TIMEOUT_CONFIG_ABSENT',
                  description: `No timeout detected on external HTTP/network resource.`,
                  confidence: 0.88
                })
              ],
              source: this.id,
              confidence: 0.88
            })
          );
        }

        if (meta.hasCircuitBreaker === false) {
          signals.push(
            HealthSignalHelper.createSignal({
              featureId,
              signalType: 'MISSING_CIRCUIT_BREAKER',
              severity: 'MEDIUM',
              value: mapping.resourceId,
              normalizedValue: 65,
              description: `External service integration "${mapping.resourceId}" lacks circuit breaker protection.`,
              evidence: [
                HealthSignalHelper.createEvidence({
                  sourceType: 'INTEGRATION_RESOURCE',
                  sourceId: mapping.resourceId,
                  evidenceType: 'CIRCUIT_BREAKER_ABSENT',
                  description: `Remote dependency without fail-fast circuit breaker mechanism.`,
                  confidence: 0.82
                })
              ],
              source: this.id,
              confidence: 0.82
            })
          );
        }
      }
    }

    return signals;
  }
}
