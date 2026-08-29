# Prompt Engineering

The Prompt Engineering module converts the task and `ContextPackage` into a versioned, traceable `SLMRequest`.

## Builders
1. **`SystemPromptBuilder`**: Emits the core operating principles, role boundaries, hallucination rejection rules, and JSON output schema.
2. **`TaskPromptBuilder`**: Formats the user objective and constraints into a standardized task definition.
3. **`ContextPromptBuilder`**: Formats the `ContextPackage` into structured XML sections (`<PROJECT_CONTEXT>`, `<SYMBOL>`, `<DEPENDENCY>`, `<RECENT_CHANGE>`, `<MEMORY>`, `<CONTEXT_CONFLICTS>`) with trust and provenance tags.
4. **`PromptBuilder`**: Combines builders into an `SLMRequest` and emits a `PromptTrace` for evaluation.

## Traceability
Every generated request includes a `PromptTrace` in its metadata:
- `requestId`: Unique request identifier
- `promptVersion`: Version of the prompt builder (`1.0`)
- `contextPackageId`: ID of the assembled context package
- `tokenEstimate`: Total estimated tokens
- `timestamp`: Timestamp of generation
