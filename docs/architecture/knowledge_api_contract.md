# Knowledge API Contract

## Request
```typescript
interface KnowledgeRequest {
  repositoryId: string;
  snapshotId?: string;
  operation: string;
  parameters: Record<string, any>;
  include?: string[];
}
```

## Response
```typescript
interface KnowledgeResponse<T = any> {
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
  explanation?: any; 
}
```
