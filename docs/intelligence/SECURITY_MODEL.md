# Security Model & Autonomy Gating

## Autonomy Levels

| Level | Name | Approval Gating Policy |
|---|---|---|
| `LEVEL_0_MANUAL` | Manual | Every individual step requires explicit user approval. |
| `LEVEL_1_ASSISTED` | Assisted | Read-only analysis auto-approved; all file modifications and executions require approval. |
| `LEVEL_2_CONTROLLED` | Controlled | Safe file edits auto-approved; high-risk actions (shell commands, deletions) require approval. |
| `LEVEL_3_BOUNDED_AUTONOMOUS` | Bounded Autonomous | Autonomous operation bounded strictly by token budget, cycle limits, and policy constraints. |
| `LEVEL_4_AUTONOMOUS` | Unrestricted | **STRICTLY FORBIDDEN**. Any request specifying Level 4 is immediately rejected with `AgentSecurityError`. |

## Prompt Injection Defense

Untrusted user input and repository file contents are screened for adversarial patterns:
- Injections such as "ignore previous instructions", "system override", "developer mode", and "bypass guardrails" trigger immediate `AgentSecurityError`.
- Repository file content provided in context prompts is strictly delimited within XML tags:
  ```xml
  <repository-data resource="path/to/file.ts">
  ...
  </repository-data>
  ```

## Secret Redaction

The `SecuritySanitizer` scans all prompts and audit trails, redacting sensitive secrets matching:
- AWS Access Key IDs (`AKIA...`)
- Bearer / JSON Web Tokens (`eyJ...`)
- RSA/EC/OpenSSH private key blocks (`-----BEGIN PRIVATE KEY-----`)
- Password and API key assignment strings
