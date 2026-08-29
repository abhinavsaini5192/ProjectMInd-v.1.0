# Modification Impact

Before a patch is applied, the system generates a `ModificationImpact` score.

## Public API Protection
If the `ModificationIntent` targets a public interface, an exported class, or an API route, the system marks `publicApiChanged: true` and elevates the impact level. High-impact modifications are more likely to trigger the `RiskGate` in Phase 4.4, automatically elevating the action from an autonomous `ALLOW` to a human-gated `REQUIRE_APPROVAL`.
