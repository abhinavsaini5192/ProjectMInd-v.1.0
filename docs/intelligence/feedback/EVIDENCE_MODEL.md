# Evidence Model & Confidence Scoring

Every learning candidate or goal evaluation must cite grounded evidence.

## Evidence Sources
- `EXECUTION`: Output from executed commands, file diffs, and modifications.
- `TEST`: Output from unit, integration, and property test runners.
- `BUILD`: Compiler errors, typecheck diagnostics, and bundle results.
- `DIFF`: Git/filesystem change trees.
- `KNOWLEDGE_GRAPH`: Static AST, symbol, and relationship queries.
- `USER_CONFIRMATION`: Explicit user feedback and interactive corrections.

## Reliability & Weighting
Direct execution outcomes and user confirmations have the highest reliability ($0.95 - 1.0$), while heuristic inferences require corroborating evidence before promotion.
