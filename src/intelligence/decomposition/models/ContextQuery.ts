export type ContextQueryType =
  | 'SYMBOL'
  | 'FILE'
  | 'MODULE'
  | 'DEPENDENCY'
  | 'RELATIONSHIP'
  | 'ARCHITECTURE'
  | 'CONFIGURATION'
  | 'TEST'
  | 'HISTORY'
  | 'MEMORY'
  | 'WORKSPACE';

export interface ContextQuery {
  queryId: string;
  subtaskId: string;
  type: ContextQueryType;
  queryTarget: string;
  reason: string;
  priority: number;
  expectedInformationGain: number; // 0.0 to 1.0
}
