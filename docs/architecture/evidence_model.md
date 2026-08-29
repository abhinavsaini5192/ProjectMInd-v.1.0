# Evidence Model

To prevent the SLM from becoming confused or exceeding token limits, the `EvidencePackageBuilder` strictly constrains what the model is allowed to see.

Instead of sending raw source code, it sends:
1. The Task Intent.
2. A constrained list of candidate entities (e.g., the top 50 files identified by the deterministic Brain).
3. Relevant architectural metadata.

The SLM is then asked to rank or select from *only* these candidates. Hallucinations are immediately rejected by the `SLMOutputValidator`.
