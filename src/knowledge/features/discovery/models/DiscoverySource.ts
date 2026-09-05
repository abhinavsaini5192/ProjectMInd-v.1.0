export type DiscoverySourceType =
  | 'ENDPOINT'
  | 'MODULE'
  | 'SYMBOL'
  | 'DEPENDENCY'
  | 'TEST'
  | 'CONFIGURATION'
  | 'DOCUMENTATION'
  | 'HISTORY';

export interface DiscoveredEndpoint {
  method: string;
  path: string;
  handlerSymbolId?: string;
  filePath?: string;
  tags?: string[];
}

export interface DiscoveredModule {
  id: string;
  name: string;
  path: string;
  exports?: string[];
  dependencies?: string[];
}

export interface DiscoveredSymbol {
  id: string;
  name: string;
  kind?: string;
  filePath: string;
  exported?: boolean;
}

export interface DiscoveredDependency {
  sourceId: string;
  targetId: string;
  type?: string;
}

export interface DiscoveredTestCase {
  filePath: string;
  suiteName?: string;
  testCases?: string[];
  targetFile?: string;
}

export interface DiscoveredConfiguration {
  key: string;
  valueMasked?: string;
  filePath?: string;
  category?: string;
}

export interface DiscoveredDocumentation {
  filePath: string;
  title?: string;
  sections?: Array<{ heading: string; content: string }>;
}

export interface DiscoveredHistory {
  commitHash: string;
  message: string;
  changedFiles: string[];
  timestamp: number;
}

export interface DiscoveryContext {
  workspaceId: string;
  repositoryId: string;
  scope?: string;
  endpoints?: DiscoveredEndpoint[];
  modules?: DiscoveredModule[];
  symbols?: DiscoveredSymbol[];
  dependencies?: DiscoveredDependency[];
  tests?: DiscoveredTestCase[];
  configurations?: DiscoveredConfiguration[];
  documentation?: DiscoveredDocumentation[];
  history?: DiscoveredHistory[];
  metadata?: Record<string, any>;
}
