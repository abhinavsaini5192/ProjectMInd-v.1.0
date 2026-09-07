import type { Feature } from '../../models/Feature';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type {
  DiscoveredEndpoint,
  DiscoveredModule,
  DiscoveredSymbol,
  DiscoveredDependency,
  DiscoveredTestCase,
  DiscoveredConfiguration,
  DiscoveredDocumentation,
  DiscoveredHistory,
} from '../../discovery/models/DiscoverySource';
import type {
  DiscoveredDatabaseEntity,
  DiscoveredUIComponent,
  DiscoveredCommand,
} from '../../mapping/interfaces/IFeatureMappingSource';

export interface DiscoveredIntegrationEvent {
  eventId: string;
  eventName: string;
  publisherResourceId?: string;
  consumerResourceId?: string;
  channel?: string;
}

export interface DiscoveredArchitectureCapability {
  layer: 'PLATFORM' | 'DOMAIN' | 'APPLICATION' | 'INFRASTRUCTURE';
  featureId: string;
  capabilityType: string;
}

export interface DependencyContext {
  workspaceId: string;
  repositoryId: string;
  knowledgeVersion?: string;
  featureMappings?: FeatureResourceMapping[];
  endpoints?: DiscoveredEndpoint[];
  modules?: DiscoveredModule[];
  symbols?: DiscoveredSymbol[];
  dependencies?: DiscoveredDependency[];
  tests?: DiscoveredTestCase[];
  configurations?: DiscoveredConfiguration[];
  databaseEntities?: DiscoveredDatabaseEntity[];
  uiComponents?: DiscoveredUIComponent[];
  commands?: DiscoveredCommand[];
  documentation?: DiscoveredDocumentation[];
  history?: DiscoveredHistory[];
  integrationEvents?: DiscoveredIntegrationEvent[];
  architectureCapabilities?: DiscoveredArchitectureCapability[];
}

export interface IFeatureRelationshipSource {
  readonly sourceType: string;
  readonly name: string;

  getSourceType(): string;
  supports(relationshipType: FeatureRelationshipType): boolean;
  discoverRelationships(
    feature: Feature,
    allFeatures: Feature[],
    context: DependencyContext
  ): Promise<FeatureRelationshipCandidate[]> | FeatureRelationshipCandidate[];
  discoverCandidates(
    allFeatures: Feature[],
    context: DependencyContext
  ): Promise<FeatureRelationshipCandidate[]> | FeatureRelationshipCandidate[];
}
