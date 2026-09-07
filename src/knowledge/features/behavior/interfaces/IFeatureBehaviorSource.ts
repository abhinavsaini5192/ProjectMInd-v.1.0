import type { Feature } from '../../models/Feature';
import type { FeatureId } from '../../models/FeatureId';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping';
import type { FeatureRelationship } from '../../dependencies/models/FeatureRelationship';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';

export interface ExtractionContext {
  endpoints?: any[];
  symbols?: any[];
  files?: any[];
  databaseEntities?: any[];
  integrationEvents?: any[];
  testArtifacts?: any[];
  gitHistory?: any[];
  configuration?: Record<string, any>;
  [key: string]: any;
}

export interface BehaviorContext {
  feature: Feature;
  mappings: FeatureResourceMapping[];
  relationships?: FeatureRelationship[];
  allFeatures?: Feature[];
  allMappings?: Map<FeatureId, FeatureResourceMapping[]> | FeatureResourceMapping[];
  extraction?: ExtractionContext;
  configuration?: Record<string, any>;
}

export interface IFeatureBehaviorSource {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly priority: number;
  extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]>;
}
