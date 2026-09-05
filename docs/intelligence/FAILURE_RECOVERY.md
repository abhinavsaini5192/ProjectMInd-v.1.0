# Failure Taxonomy & Error Recovery Matrix

## 13 Standardized Failure Categories

| Category | Description | Default Recovery Action | Fatal? |
|---|---|---|---|
| `USER_ERROR` | Invalid parameters, constraints, or conflicting user requests | `REQUEST_USER_INTERVENTION` | No |
| `MODEL_ERROR` | Malformed JSON schema, unparsable output, hallucinated keys | `FALLBACK_MODEL` | No |
| `CONTEXT_ERROR` | Token overflow, missing required context package, retrieval fault | `RETRY_WITH_REDUCED_CONTEXT` | No |
| `PLANNING_ERROR` | Cycle in dependencies, unreachable postconditions, stale resources | `REPAIR_PLAN` | No |
| `POLICY_ERROR` | Unauthorized action attempted under policy | `REQUEST_USER_INTERVENTION` | No |
| `EXECUTION_ERROR` | Tool failed, file write permission denied, build syntax error | `ROLLBACK` | No |
| `VERIFICATION_ERROR`| Postcondition checks failed, unit tests broke | `REPAIR_PLAN` | No |
| `ENVIRONMENT_ERROR`| External tool missing, transient network disconnect | `RETRY_WITH_BACKOFF` | No |
| `RESOURCE_ERROR` | Disk space exhausted, memory limit exceeded | `ABORT` | Yes |
| `TIMEOUT` | Operation exceeded deadline | `ABORT` | Yes |
| `BUDGET_EXCEEDED` | Exceeded token budget or cycle budget | `ABORT` | Yes |
| `SECURITY_ERROR` | Prompt injection attempt, secret leak, forbidden autonomy | `ABORT` | Yes |
| `SYSTEM_ERROR` | Internal unhandled exception | `ABORT` | Yes |

## Deterministic Recovery Workflow

```
Caught Error
     │
     ▼
FailureTaxonomy.classify(error, source)
     │
     ├─ Fatal Category? ──────► Abort Task & Record Metric
     │
     └─ Non-Fatal Category? ──► Execute Mapped Recovery Action:
                                 - FALLBACK_MODEL: Query next compatible SLM
                                 - RETRY_WITH_REDUCED_CONTEXT: Prune lowest-ranked chunks
                                 - REPAIR_PLAN: FeedbackEngine feeds delta to Planning
                                 - ROLLBACK: Revert applied patch changes
```
