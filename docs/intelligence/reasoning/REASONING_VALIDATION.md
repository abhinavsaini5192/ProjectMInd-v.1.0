# Reasoning Validation

The `ReasoningValidator` enforces strict quality, grounding, and consistency guardrails on every model output.

## Validators
1. **`SchemaValidator`**: Enforces required identifiers, non-empty collections, and valid numerical bounds ($0 \le \text{confidence} \le 1$).
2. **`EvidenceValidator`**: Verifies that every `evidence` item cites a valid `sourceId` present in the `ContextPackage` or repository knowledge graph. Rejects fabricated source IDs.
3. **`ConsistencyValidator`**: Detects contradictory assertions among generated conclusions.
4. **`ConfidenceValidator`**: Flags high confidence scores that lack supporting observations or evidence.
