import type { FeatureRelationship } from './FeatureRelationship';
import type { FeatureDependencyConflict } from './FeatureDependencyConflict';
import type { FeatureDependencyCycle } from './FeatureDependencyCycle';

export interface FeatureDependencyStatistics {
  featuresEvaluated: number;
  candidateRelationships: number;
  relationshipsCreated: number;
  relationshipsUpdated: number;
  relationshipsDeactivated: number;
  conflictsDetected: number;
  cyclesDetected: number;
  sourcesExecuted: number;
  duration: number;
  slmCalls: number;
  tokensUsed: number;
}

export interface FeatureDependencyResult {
  runId: string;
  startedAt: number;
  completedAt: number;
  relationships: FeatureRelationship[];
  newRelationships: FeatureRelationship[];
  updatedRelationships: FeatureRelationship[];
  deactivatedRelationships: FeatureRelationship[];
  conflicts: FeatureDependencyConflict[];
  cycles: FeatureDependencyCycle[];
  statistics: FeatureDependencyStatistics;
}
