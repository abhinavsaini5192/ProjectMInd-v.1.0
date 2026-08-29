# Decision Engine Core

The Decision Engine (Layer 3.1) acts as the central brain of ProjectMind. It consumes the Knowledge API (L2.9) to transform a raw user task into a highly optimized, explainable Context Plan.

## Responsibilities
- **Task Decomposition**: Breaking complex tasks into semantic subtasks.
- **Feature Resolution**: Deterministically resolving subtasks into ProjectMind Feature IDs.
- **Context Planning & Budgeting**: Selecting the exact Knowledge items the coding agent needs to know, ranking them, and trimming them to fit a token budget.
- **Risk Assessment**: Calculating structural and architectural risk using dependency depth metrics.

The Decision Engine strictly outputs context plans. It does not execute code, nor does it hallucinate knowledge via LLMs.
