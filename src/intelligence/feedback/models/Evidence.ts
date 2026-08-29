export type EvidenceSourceType =
  | 'EXECUTION'
  | 'TEST'
  | 'BUILD'
  | 'DIFF'
  | 'KNOWLEDGE_GRAPH'
  | 'USER_CONFIRMATION'
  | 'EXTERNAL_TOOL';

export interface Evidence {
  evidenceId: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  description: string;
  timestamp: number;
  reliability: number;
  confidence: number;
}
