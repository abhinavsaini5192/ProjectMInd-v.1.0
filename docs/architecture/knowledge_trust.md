# Knowledge Trust

Higher-level decision systems must know whether the context they are operating on is safe. 
This is codified into `KnowledgeTrust` metadata exposed directly in the Knowledge API (L2.9):

```typescript
interface KnowledgeTrust {
  score: number;
  validated: boolean;
  lastValidated: string;
  validationVersion: string;
}
```
