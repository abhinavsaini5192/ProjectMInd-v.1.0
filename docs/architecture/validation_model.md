# Validation Model

The validation system relies on `ValidationEngine` triggering a suite of domain-specific validators (e.g., `RelationshipValidator`).

Results are emitted as a `ValidationReport`:
```typescript
interface ValidationReport {
  repositoryId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  score: number;
  checks: Record<string, 'PASS' | 'FAIL' | 'WARN'>;
  issues: ValidationIssue[];
}
```
