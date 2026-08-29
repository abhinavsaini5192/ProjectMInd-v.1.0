# Context Evaluation

ProjectMind evaluates its own context plans using downstream signals.

Categories:
- **USEFUL**: Context that was provided and subsequently modified or heavily accessed by the downstream agent.
- **UNUSED**: Context that was provided but ignored, wasting tokens.
- **MISSING**: Context that was NOT provided, but the agent had to independently discover and modify to complete the task.
- **MISLEADING**: Context that caused the agent to hallucinate or take the wrong path (usually tagged via explicit human feedback).

By tracking this, the engine mathematically determines exactly how accurate its context retrieval was for any given decision.
