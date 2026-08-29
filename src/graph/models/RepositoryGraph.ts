import { GraphNode } from './GraphNode';

export interface RepositoryGraph {
  repositoryId: string;
  nodes: Map<string, GraphNode>;
  edges: Map<string, any>;
  version: number;
  lastUpdated: string;
}
