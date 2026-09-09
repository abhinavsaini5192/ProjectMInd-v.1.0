import type { Feature } from '../../models/Feature.js';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping.js';
import type { FeatureDependency } from '../../dependencies/models/FeatureDependency.js';
import type { FeatureDependencyCycle } from '../../dependencies/models/FeatureDependencyCycle.js';
import type { FeatureBehaviorResult } from '../../behavior/models/FeatureBehaviorResult.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import type { FeatureHealthDimension } from '../models/FeatureHealthDimension.js';

export interface HealthConfiguration {
  highComplexityThreshold: number; // e.g. 20
  highCouplingThreshold: number; // e.g. 10
  highChurnThreshold: number; // e.g. 15
  lowTestRatioThreshold: number; // e.g. 0.2
  lowConfidenceThreshold: number; // e.g. 0.5
  dimensionWeights: Record<FeatureHealthDimension, number>;
}

export const DEFAULT_HEALTH_CONFIGURATION: HealthConfiguration = {
  highComplexityThreshold: 20,
  highCouplingThreshold: 10,
  highChurnThreshold: 15,
  lowTestRatioThreshold: 0.2,
  lowConfidenceThreshold: 0.5,
  dimensionWeights: {
    STRUCTURAL_HEALTH: 0.1,
    DEPENDENCY_HEALTH: 0.1,
    BEHAVIOR_HEALTH: 0.1,
    VERIFICATION_HEALTH: 0.15,
    ARCHITECTURE_HEALTH: 0.1,
    STABILITY_HEALTH: 0.1,
    INTEGRATION_HEALTH: 0.1,
    SECURITY_HEALTH: 0.1,
    COMPLEXITY_HEALTH: 0.1,
    CONFIDENCE_HEALTH: 0.05
  }
};

export interface HealthContext {
  feature: Feature;
  mappings?: FeatureResourceMapping[];
  dependencies?: FeatureDependency[];
  dependents?: FeatureDependency[];
  cycles?: FeatureDependencyCycle[];
  behavior?: FeatureBehaviorResult;
  allFeatures?: Feature[];
  allMappings?: FeatureResourceMapping[];
  config?: HealthConfiguration;
  metadata?: Record<string, unknown>;
}

export function getFeatureId(feature: Feature): string {
  return (feature as unknown as { featureId?: string }).featureId || feature.id;
}

export interface IFeatureHealthSignal {
  readonly id: string;
  readonly signalType: HealthSignalType;
  compute(context: HealthContext): Promise<HealthSignal[]>;
}
