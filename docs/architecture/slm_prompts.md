# SLM Prompts

Prompts are treated as versioned source code. They are stored in `src/intelligence/slm/prompts/` rather than scattered dynamically throughout the codebase.

When inference occurs, the specific prompt version (e.g., `feature-interpretation.v1`) is recorded in the `SLMMetadata` so that future analysis can distinguish between a bad model and a bad prompt.
