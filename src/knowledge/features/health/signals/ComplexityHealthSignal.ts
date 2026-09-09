import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class ComplexityHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'ComplexityHealthSignal';
  public readonly signalType: HealthSignalType = 'HIGH_CYCLOMATIC_COMPLEXITY';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const mappings = context.mappings || [];
    const highComplexityThreshold = context.config?.highComplexityThreshold ?? 20;

    let maxComplexity = 0;
    let highComplexityResourceCount = 0;
    let largeFileCount = 0;

    for (const mapping of mappings) {
      const meta = (mapping as unknown as { metadata?: Record<string, unknown> }).metadata || {};
      const complexity = typeof meta.cyclomaticComplexity === 'number' ? meta.cyclomaticComplexity : 0;
      const loc = typeof meta.linesOfCode === 'number' ? meta.linesOfCode : 0;
      const nesting = typeof meta.nestingDepth === 'number' ? meta.nestingDepth : 0;

      if (complexity > maxComplexity) {
        maxComplexity = complexity;
      }

      if (complexity >= highComplexityThreshold) {
        highComplexityResourceCount++;
        signals.push(
          HealthSignalHelper.createSignal({
            featureId: context.feature.featureId,
            signalType: 'HIGH_CYCLOMATIC_COMPLEXITY',
            severity: complexity >= highComplexityThreshold * 1.5 ? 'HIGH' : 'MEDIUM',
            value: complexity,
            normalizedValue: Math.min(100, Math.round((complexity / highComplexityThreshold) * 70)),
            description: `Resource "${mapping.resourceId}" has high cyclomatic complexity (${complexity} >= ${highComplexityThreshold}).`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'MAPPING_RESOURCE',
                sourceId: mapping.resourceId,
                evidenceType: 'COMPLEXITY_METRIC',
                description: `Cyclomatic complexity of ${complexity} detected in resource ${mapping.resourceId}.`,
                strength: Math.min(1.0, complexity / (highComplexityThreshold * 2)),
                confidence: 0.9,
                metadata: { complexity, resourceId: mapping.resourceId }
              })
            ],
            source: this.id,
            confidence: 0.9
          })
        );
      }

      if (nesting >= 5) {
        signals.push(
          HealthSignalHelper.createSignal({
            featureId: context.feature.featureId,
            signalType: 'DEEP_NESTING',
            severity: nesting >= 8 ? 'HIGH' : 'MEDIUM',
            value: nesting,
            normalizedValue: Math.min(100, nesting * 12),
            description: `Resource "${mapping.resourceId}" exhibits deep nesting depth of ${nesting}.`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'MAPPING_RESOURCE',
                sourceId: mapping.resourceId,
                evidenceType: 'NESTING_METRIC',
                description: `Nesting depth of ${nesting} detected in ${mapping.resourceId}.`,
                strength: 0.8,
                confidence: 0.85
              })
            ],
            source: this.id,
            confidence: 0.85
          })
        );
      }

      if (loc >= 800) {
        largeFileCount++;
        signals.push(
          HealthSignalHelper.createSignal({
            featureId: context.feature.featureId,
            signalType: 'LARGE_FILE_SIZE',
            severity: loc >= 1500 ? 'HIGH' : 'LOW',
            value: loc,
            normalizedValue: Math.min(100, Math.round((loc / 1000) * 50)),
            description: `Resource "${mapping.resourceId}" is large (${loc} lines of code).`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'MAPPING_RESOURCE',
                sourceId: mapping.resourceId,
                evidenceType: 'LOC_METRIC',
                description: `File size is ${loc} lines.`,
                confidence: 0.95
              })
            ],
            source: this.id,
            confidence: 0.95
          })
        );
      }
    }

    return signals;
  }
}
