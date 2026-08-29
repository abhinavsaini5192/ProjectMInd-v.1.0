# Structured Reasoning Engine

The `StructuredReasoningEngine` coordinates model inference, reasoning strategies, output parsing, schema validation, and evidence grounding verification.

## Architectural Data Flow

```
ReasoningTask
      ↓
ContextPackage
      ↓
StructuredReasoningEngine
      ↓
Strategy Selection (BugFix, CodeReview, Architecture, Planning)
      ↓
ModelSelector (Capability matching, ModelRegistry)
      ↓
PromptBuilder (Versioned prompt construction, PromptTrace)
      ↓
InferenceManager → SLMRuntime → SLM
      ↓
StructuredOutputParser (JSON code-block and substring extraction)
      ↓
ReasoningNormalizer (Confidence clamping, default arrays)
      ↓
ReasoningValidator (Schema, Evidence grounding, Consistency, Confidence)
      ↓
ReasoningResult (Observations, Hypotheses, Evidence, Conclusions, Decisions)
      ↓
Brain Decision Layer
```

## Key Principles
1. **Zero Execution**: The reasoning layer formulates proposals, observations, and plans; it never directly executes commands or writes files.
2. **Grounding**: All cited evidence must match real context items; fabricated source IDs are rejected.
3. **Resilience**: JSON parsing handles markdown fences and substring extraction, with bounded retry for malformed outputs.
