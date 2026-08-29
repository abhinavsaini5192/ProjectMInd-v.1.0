export interface ContextGraphNode {
  id: string;
  type: 'TASK' | 'FEATURE' | 'ARCHITECTURE' | 'SYMBOL' | 'RELATIONSHIP' | 'DEPENDENCY' | 'TEST' | 'CONFIGURATION' | 'DECISION' | 'HISTORY' | 'DOCUMENTATION';
  data: any;
}

export interface ContextGraphEdge {
  sourceId: string;
  targetId: string;
  type: 'REQUIRES' | 'EXPLAINS' | 'DEPENDS_ON' | 'VALIDATES' | 'CONTEXT_FOR' | 'PRECEDES' | 'CONTRADICTS' | 'SUPERSEDES';
}

export interface ContextGraph {
  nodes: ContextGraphNode[];
  edges: ContextGraphEdge[];
}
