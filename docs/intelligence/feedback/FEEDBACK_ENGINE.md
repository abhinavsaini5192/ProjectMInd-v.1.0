# Feedback Engine Architecture

The Feedback Engine (`src/intelligence/feedback/core/FeedbackEngine.ts`) transforms execution results into validated knowledge and structured feedback for future cognitive cycles.

## Core Responsibilities
1. **Execution Observation**: Records changed, added, deleted, and moved files alongside test and build outcomes.
2. **Change Analysis**: Maps physical file modifications to semantic symbols, dependencies, and architectural layers.
3. **Outcome Analysis & Goal Evaluation**: Decouples execution success from objective goal achievement.
4. **Evidence-Based Failure Analysis**: Categorizes failure modes (e.g. `ENVIRONMENT_FAILURE`, `TEST_FAILURE`, `BUILD_FAILURE`, `PERMISSION_FAILURE`) with actionable recommendations (`RETRY`, `REPLAN`, `ASK_USER`).
5. **Learning Curation & Promotion**: Validates, deduplicates, and promotes high-confidence learning candidates into persistent memory.
6. **Integration & Invalidation**: Updates Knowledge Graph, persists promoted memories, and invalidates affected context slices.
7. **Idempotency & Safety**: Protects against duplicate event ingestion and sanitizes untrusted tool outputs.
