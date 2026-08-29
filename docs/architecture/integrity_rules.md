# Integrity Rules

To pass Cross-Layer validation, the following invariants MUST hold:
1. Every Symbol in a Relationship must physically exist in the Symbol Registry.
2. Dependencies cannot form illegal cyclic boundaries (unless marked explicitly as a Warning).
3. Evolution snapshots must remain chronologically sorted.
4. AST Node IDs must be unique globally across the Knowledge Graph.
