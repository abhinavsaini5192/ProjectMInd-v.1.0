# Verification Checks

The `VerificationPlanner` dynamically chooses checks based on the `ActionGraph` and impact flags.

## Available Checks
1. **FileCheck**: Compares pre/post repository snapshots to detect runaway mutations.
2. **SyntaxCheck**: Scans modified files for structural invalidity (e.g., missing brackets).
3. **SymbolCheck**: Verifies expected APIs still exist.
4. **DependencyCheck**: Ensures no circular imports or broken edges were introduced.
5. **ArchitectureCheck**: Enforces boundary rules (e.g., UI layer cannot import DB layer).
6. **TaskOutcomeCheck**: Assesses whether the original user request was conceptually satisfied.
