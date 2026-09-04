# Context Ranking & Relevance Scoring

The `RelevanceScorer` evaluates candidate relevance using a weighted multi-factor model:

## Ranking Factors
1. **Structural Relevance (35%)**: Direct AST targets (1.0), immediate parent/child/module relations (0.85).
2. **Dependency Distance (25%)**: Target symbol = distance 0 (1.0), direct callers/callees = distance 1 (0.9), distance 2 (0.7), distance $\ge 3$ ($\le 0.4$).
3. **Semantic Relevance (25%)**: Keyword overlap and intent matching with subtask objectives.
4. **Recency (10%)**: Boosts recently modified or committed files ($< 1$ hour = 1.0, $< 24$ hours = 0.9).
5. **Source Confidence (5%)**: Direct code facts (1.0), inferred relationships (0.85), memory recollections (0.75).
