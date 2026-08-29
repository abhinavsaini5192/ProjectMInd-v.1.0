# Knowledge API v1

Version 1 of the Knowledge API exposes standard endpoints for querying ProjectMind's intelligence.
It mandates that all queries pass through the `KnowledgeGateway`, which performs security and repository isolation checks before dispatching to the appropriate domain API (e.g. `FeatureKnowledgeAPI`).
