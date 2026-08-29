# Planning Security & Isolation

The Planning Engine strictly operates as a pure data transformation subsystem.

## Security Invariants
1. **Zero Execution**: No file mutation (`fs.writeFile`), shell execution (`child_process`), database modification, or tool invocation is permitted.
2. **Approval Gating**: High-risk, irreversible, or destructive actions cannot execute autonomously and require explicit user/operator approval (`NEEDS_APPROVAL`).
3. **Traceability**: Every plan maintains end-to-end provenance:
   $$\text{taskId} \rightarrow \text{contextPackageId} \rightarrow \text{reasoningId} \rightarrow \text{decisionId} \rightarrow \text{planId}$$
