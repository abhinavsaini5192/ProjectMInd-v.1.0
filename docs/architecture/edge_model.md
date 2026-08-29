# Edge Model (Relationship)

Every edge in ProjectMind is a first-class citizen containing explicit proof of its existence.

```typescript
interface Relationship {
  id: string; // Deterministic sha256 of SourceID + TargetID + Type
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  direction: 'directed' | 'bidirectional';
  confidence: number;
  weight: number;
  version: number;
  evidence: RelationshipEvidence[]; // Proof of connection
  metadata: Record<string, any>;
  history: string[];
}
```
