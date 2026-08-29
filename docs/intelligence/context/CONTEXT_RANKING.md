# Context Ranking & Scoring

Context ranking determines which pieces of knowledge are most pertinent to the current task.

## Scoring Formula
The `ContextScorer` calculates a multi-factor score:

$$\text{FinalScore} = \left( 0.30 \cdot \text{TaskRelevance} + 0.35 \cdot \text{ExplicitMention} + 0.15 \cdot \text{DependencyProximity} + 0.10 \cdot \text{TrustWeight} + 0.10 \cdot \text{RecencyWeight} \right) \times \text{PriorityMultiplier}$$

### Factors
- **Explicit Mention**: Direct references in user prompt (e.g. `AuthService.ts`) receive a significant boost.
- **Dependency Proximity**: Direct neighbors in the dependency graph receive high priority.
- **Trust Level**: Verified code facts outscore unverified or historical memories.
- **Recency**: Recent changes and newly verified memories receive higher weight.

## Deduplication & Conflict Detection
The `ContextDeduplicator` merges identical facts and combines their source provenance. If two sources assert conflicting facts about the same entity, a `ContextConflict` is created so the model can reason about the discrepancy explicitly.
