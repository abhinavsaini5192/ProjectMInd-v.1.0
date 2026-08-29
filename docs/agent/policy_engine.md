# Policy Engine

The `PolicyEngine` enforces hierarchical control over agent behavior.

## Hierarchy Precedence
1. `SYSTEM`
2. `GLOBAL`
3. `PROJECT`
4. `AGENT`
5. `TASK`

## Evaluation Rules
Policies are evaluated strictly from `SYSTEM` down to `TASK`.
- If a higher-level policy evaluates to `DENY`, the evaluation immediately locks to `DENY`. 
- **A lower-level `ALLOW` can NEVER override a higher-level `DENY`.**

This ensures that a repository-specific configuration (`PROJECT`) cannot accidentally expose the system by overriding a `SYSTEM` or `GLOBAL` security rule.
