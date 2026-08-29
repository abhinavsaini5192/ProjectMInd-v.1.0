# Query Explainability

ProjectMind is not a black-box AI.

Every query produces a `QueryExplanation` object containing:
- Which internal indexes were hit
- The exact IDs of the entities traversed
- A reasoning trace of why the data matched the filters

This ensures the future Decision Engine can trust and reference the returned data.
