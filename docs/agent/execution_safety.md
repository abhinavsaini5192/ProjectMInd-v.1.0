# Execution Safety

The final tier of safety lives in the Execution Engine. Even if an SLM hallucinates a malicious action and the Policy Engine is misconfigured to allow it, execution safety guards will still intervene.

## PathGuard
The `PathGuard` evaluates every file-based action.
It strictly prevents:
- **Directory Traversal**: `../../secret.key`
- **Absolute Escapes**: `C:/Windows/System32` or `/etc/passwd`.

## Dry-Run
`dryRun: true` allows the entire pipeline to simulate an execution pass (including testing `PathGuard` constraints) without modifying a single bit on disk.
