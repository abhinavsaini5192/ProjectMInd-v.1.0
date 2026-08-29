export interface KnowledgeRequest {
  repositoryId: string;
  snapshotId?: string;
  operation: string;
  parameters: Record<string, any>;
  include?: string[];
}
