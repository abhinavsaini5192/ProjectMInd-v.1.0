# Model Selection

The Model Selector allows the Brain to request reasoning capabilities instead of hard-coding specific model vendors or identifiers.

## Process
1. **Requirements**: The Brain submits a `ModelRequirements` object (e.g., `minimumContextWindow: 16000`, `requiresStructuredOutput: true`).
2. **Hard Filtering**: The `CapabilityMatcher` iterates over all `AVAILABLE` models in the `ModelRegistry`. Any model failing a hard requirement is strictly rejected, generating a verbose rejection reason.
3. **Ranking**: The `ModelRankingStrategy` calculates a `ModelScore` for the remaining candidates. Models are scored on context size, capabilities, and local preference.
4. **Selection**: The highest-ranked model is chosen, returning a `ModelSelectionResult`.
5. **No Compatible Model**: If no models pass the hard filtering, a `NoCompatibleModelError` is thrown, preventing the agent from silently making a bad request.
