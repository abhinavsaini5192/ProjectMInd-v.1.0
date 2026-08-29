# Query Model

The structured `IQuery` interface provides a unified programmatic way to query repository intelligence.

```typescript
export interface IQuery {
  entity: 'repository' | 'symbol' | 'feature' | 'relationship' | 'dependency' | 'architecture' | 'evolution' | 'impact';
  operation: string;
  filters: Record<string, any>;
  include?: string[];
  snapshotId?: string; 
}
```

Queries return an `IQueryResult`, which importantly includes the `data`, `sources` (evidence), and `explanation` (trace).
