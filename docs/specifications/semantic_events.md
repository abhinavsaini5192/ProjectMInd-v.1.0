# Semantic Events Specification

Semantic Events are the internal currency of ProjectMind's intelligence layer. They are generated deterministically and act as the single source of truth for repository evolution.

## Event Types (`SemanticEventType`)
- `FeatureAdded`: When new structural logic is detected.
- `FeatureRemoved`: When features are stripped.
- `BugFixed`: Explicit fixes (often inferred from commit links in future phases).
- `Refactored`: "Pure" refactors where AST bodies change but signatures and exports remain identical.
- `BreakingChange`: Exported symbols are removed or their signatures change.
- `ArchitectureChanged`: Boundary violations or circular dependencies.
- `DependencyUpdated`: `package.json` or manifest alterations.

## Payload
Every Semantic Event contains:
- `id`: UUID
- `timestamp`: ISO String
- `description`: Human-readable summary
- `confidence`: (0.0 to 1.0)
- `metadata`: Raw detector output (e.g. file paths, old/new signatures)
- `impact`: Array of downstream IDs or paths affected by this event.
