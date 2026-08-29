export interface KnowledgeResponse<T = any> {
  requestId: string;
  apiVersion: string;
  repositoryId: string;
  snapshotId: string;
  data: T;
  metadata: Record<string, any>;
  knowledgeVersion: string;
  generatedAt: number;
  confidence: number;
  sources: string[];
  explanation?: any; // Trace or explainability payload
}
