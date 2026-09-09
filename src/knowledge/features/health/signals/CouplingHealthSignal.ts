import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class CouplingHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'CouplingHealthSignal';
  public readonly signalType: HealthSignalType = 'HIGH_EFFERENT_COUPLING';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const threshold = context.config?.highCouplingThreshold ?? 10;
    const dependencies = context.dependencies || [];
    const dependents = context.dependents || [];

    const efferentCount = dependencies.length;
    const afferentCount = dependents.length;

    // High efferent coupling: depends on too many other features
    if (efferentCount >= threshold) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId: context.feature.featureId,
          signalType: 'HIGH_EFFERENT_COUPLING',
          severity: efferentCount >= threshold * 2 ? 'HIGH' : 'MEDIUM',
          value: efferentCount,
          normalizedValue: Math.min(100, Math.round((efferentCount / threshold) * 50)),
          description: `Feature "${context.feature.name}" depends on ${efferentCount} other features (threshold: ${threshold}).`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'DEPENDENCY_GRAPH',
              sourceId: context.feature.featureId,
              evidenceType: 'EFFERENT_COUPLING',
              description: `Outgoing dependencies count is ${efferentCount}.`,
              confidence: 0.95,
              metadata: { efferentCount, threshold }
            })
          ],
          source: this.id,
          confidence: 0.95
        })
      );
    }

    // High afferent coupling: too many features depend on this (high central criticality, change risk)
    if (afferentCount >= threshold) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId: context.feature.featureId,
          signalType: 'HIGH_AFFERENT_COUPLING',
          severity: afferentCount >= threshold * 2 ? 'HIGH' : 'MEDIUM',
          value: afferentCount,
          normalizedValue: Math.min(100, Math.round((afferentCount / threshold) * 50)),
          description: `Feature "${context.feature.name}" is depended upon by ${afferentCount} other features.`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'DEPENDENCY_GRAPH',
              sourceId: context.feature.featureId,
              evidenceType: 'AFFERENT_COUPLING',
              description: `Incoming dependents count is ${afferentCount}.`,
              confidence: 0.95,
              metadata: { afferentCount, threshold }
            })
          ],
          source: this.id,
          confidence: 0.95
        })
      );
    }

    // Tight coupling: any single dependency has very high strength (e.g. >= 0.85)
    for (const dep of dependencies) {
      if (dep.strength >= 0.85) {
        signals.push(
          HealthSignalHelper.createSignal({
            featureId: context.feature.featureId,
            signalType: 'TIGHT_COUPLING',
            severity: 'MEDIUM',
            value: dep.strength,
            normalizedValue: Math.round(dep.strength * 100),
            description: `Tight coupling with feature "${dep.providerFeatureId}" (strength: ${dep.strength.toFixed(2)}).`,
            evidence: [
              HealthSignalHelper.createEvidence({
                sourceType: 'FEATURE_DEPENDENCY',
                sourceId: dep.dependencyId,
                evidenceType: 'COUPLING_STRENGTH',
                description: `Dependency on ${dep.providerFeatureId} has strength ${dep.strength}.`,
                confidence: 0.9
              })
            ],
            source: this.id,
            confidence: 0.9
          })
        );
      }
    }

    // Unbalanced coupling: high afferent but zero or very low test coverage or high instability
    if (afferentCount >= 5 && efferentCount >= 10) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId: context.feature.featureId,
          signalType: 'UNBALANCED_COUPLING',
          severity: 'HIGH',
          value: `in:${afferentCount},out:${efferentCount}`,
          normalizedValue: 75,
          description: `Unbalanced coupling: Feature is both a hub (in: ${afferentCount}) and heavily dependent on others (out: ${efferentCount}).`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'DEPENDENCY_GRAPH',
              sourceId: context.feature.featureId,
              evidenceType: 'HUB_AND_SPOKE_BOTTLENECK',
              description: `Feature sits in a high-crossroad location with afferent ${afferentCount} and efferent ${efferentCount}.`,
              confidence: 0.85
            })
          ],
          source: this.id,
          confidence: 0.85
        })
      );
    }

    return signals;
  }
}
