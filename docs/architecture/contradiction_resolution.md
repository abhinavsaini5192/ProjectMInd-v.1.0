# Contradiction Resolution

The `ContradictionDetector` monitors the divergence between the deterministic Brain and the SLM.

If the Brain scores a file `0.9` but the SLM scores it `0.1` (a difference $\ge$ 0.6), a `FusionContradiction` is formally logged in the `FinalDecision`.

Depending on the `TaskWeightingPolicy`, the contradiction is resolved via:
- `DETERMINISTIC_OVERRIDE`
- `SLM_TRUSTED`
- `BLENDED`

These records are vital for downstream developers to debug why the AI agent might have received unexpected context.
