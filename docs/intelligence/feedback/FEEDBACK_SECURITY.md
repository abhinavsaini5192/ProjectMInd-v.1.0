# Feedback Security & Prompt Injection Protection

Execution feedback and terminal outputs are treated as untrusted data streams.

## Security Controls
1. **Sanitization**: Non-printable ASCII characters, control sequences, and potential prompt injection payloads are stripped before passing feedback to the Brain or SLM.
2. **Structured Schema**: Feedback is communicated via structured typed fields (`observedFact`, `evidence`, `confidence`, `source`) rather than injecting raw terminal stdout/stderr into system prompts.
3. **Execution Sandbox Boundaries**: Failures due to denied filesystem permissions (`PERMISSION_FAILURE`) escalate directly to user confirmation rather than bypassing safety policies.
