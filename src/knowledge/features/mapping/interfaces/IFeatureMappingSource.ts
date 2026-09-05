import type { Feature } from '../../models/Feature';
import type { MappingResourceType } from '../models/MappingResourceType';
import type { MappingCandidate } from '../models/MappingCandidate';
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

export interface DiscoveredDatabaseEntity {
  entityId: string;
  name: string;
  tableName?: string;
  filePath?: string;
  fields?: string[];
  relationships?: string[];
}

export interface DiscoveredUIComponent {
  componentId: string;
  name: string;
  filePath: string;
  props?: string[];
  events?: string[];
}

export interface DiscoveredCommand {
  commandId: string;
  name: string;
  signature?: string;
  filePath?: string;
}

export interface MappingContext {
  workspaceId: string;
  repositoryId: string;
  knowledgeVersion?: string;
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
}

export interface IFeatureMappingSource {
  readonly sourceType: MappingResourceType;
  readonly name: string;

  getSourceType(): MappingResourceType;
  supports(resourceType: MappingResourceType): boolean;
  mapFeature(feature: Feature, context: MappingContext): Promise<MappingCandidate[]> | MappingCandidate[];
  discoverMappings(context: MappingContext): Promise<MappingCandidate[]> | MappingCandidate[];
}
