# Security & Hardening

## Security Guarantees

1. **Read-Only Codebase Invariants**:
   - The Feature Dependency Graph engine is strictly passive.
   - It performs zero filesystem mutations and executes zero terminal commands on the user's project code.

2. **Secret Redaction**:
   - Integrated with `SecuritySanitizer.redactSecrets`.
   - Any configuration keys or values (e.g. `auth_jwt_secret`, API keys, database connection strings) are sanitized to `[REDACTED]` prior to evidence creation or explainer generation.

3. **Safe Graph Traversal**:
   - BFS pathfinding uses `visited` sets to prevent infinite recursion on cyclic graphs.
   - Cycle detection limits DFS recursion using cycle tracking stacks.

4. **Repository Scope Enforcement**:
   - Dependencies crossing repository boundaries are rejected unless explicitly configured within multi-repo scopes.
   - Untrusted documentation or commit messages are treated as unverified text, not executable facts.
