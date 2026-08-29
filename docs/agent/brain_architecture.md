# Brain Architecture

Phase 4.10 implements the topmost orchestrator of ProjectMind: the Brain Engine.

## Philosophy
The Brain does not directly modify source code or execute arbitrary bash commands. It operates in a highly controlled abstraction layer:
1. It translates an intent into a sequence of queries against the repository graph (Layer 2) and persistent Memory (Phase 4.9).
2. It ranks and limits the query results to fit within a configured token budget.
3. It dispatches the context to an external SLM.
4. It receives a structured `BrainDecision` (JSON).
5. It validates the decision against repository truth (rejecting hallucinated files/symbols).
6. It hands the validated decision to the Task Planner (Phase 4.2).
