import type { FeatureResourceMapping } from './FeatureResourceMapping';
import type { MappingConflict } from './MappingConflict';

export interface MappingStatistics {
  resourcesEvaluated: number;
  candidatesGenerated: number;
  mappingsCreated: number;
  mappingsUpdated: number;
  mappingsDeactivated: number;
  conflictsDetected: number;
  sourcesExecuted: number;
  duration: number;
}

export interface MappingResult {
  runId: string;
  featureId?: string;
  startedAt: number;
  completedAt: number;
  mappings: FeatureResourceMapping[];
  newMappings: FeatureResourceMapping[];
  updatedMappings: FeatureResourceMapping[];
  deactivatedMappings: FeatureResourceMapping[];
  conflicts: MappingConflict[];
  statistics: MappingStatistics;
}
