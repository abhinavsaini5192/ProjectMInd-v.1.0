# Reasoning & Uncertainty Engine

The Reasoning & Uncertainty Engine (Layer 3.3) sits above Context Planning (3.2) and Decision Core (3.1).
Its primary role is to ensure ProjectMind **never pretends to know something it cannot prove**.

Instead of feeding raw context into an SLM and hoping it infers the right task, this engine mathematically calculates confidence, tracks alternative interpretations (hypotheses), detects knowledge gaps, and can pause the pipeline to ask the developer a clarification question.

## Core Flow
1. **Evidence Collection**: Facts are extracted from the task and ContextPack.
2. **Hypothesis Generation**: Competing interpretations are spawned (e.g., "The bug is in JWT" vs "The bug is in OAuth").
3. **Confidence Scoring**: Each hypothesis is mathematically scored based on evidence weights.
4. **Uncertainty Classification**: The state is tagged with uncertainty types (e.g., `TASK_AMBIGUITY`) if confidence is low.
5. **Knowledge Gap Detection**: Explicit missing facts are identified.
6. **Clarification**: If required, a ranked question is generated for the developer.
