# Cycle Detection & Risk Classification

## Architectural Principle: Detection Without Deletion

In real-world legacy codebases, architectural cycles exist:
$$A \to B \to C \to A$$

**ProjectMind NEVER automatically deletes edges to force a DAG.**
Deleting edges would misrepresent repository reality and blind downstream AI reasoning agents to real structural circularity.

Instead, the engine:
1. Detects cycles using directed DFS recursion stack analysis.
2. Deduplicates cycles by normalizing the canonical vertex rotation (minimum vertex first).
3. Classifies cycles into semantic risk categories.
4. Generates non-destructive alerts and conflicts.

---

## Cycle Classifications

### 1. `ARCHITECTURAL_RISK`
- **Condition**: All relationships in the cycle are `DEPENDS_ON` with high confidence ($\ge 0.70$) between core features.
- **Impact**: Indicates tightly coupled microservices, tangled monolith domains, or architectural decay.

### 2. `SUSPECTED_CYCLE`
- **Condition**: Any relationship in the cycle is based on low-confidence or circumstantial evidence (e.g. `ASSOCIATED_WITH` Git history with score $< 0.50$).
- **Impact**: Needs human or static review before treating as a definitive cycle.

### 3. `VALIDATED_CYCLE`
- **Condition**: Concrete, verified code or endpoint interactions forming a circular loop.
- **Impact**: Confirmed circular execution or circular build dependency.
