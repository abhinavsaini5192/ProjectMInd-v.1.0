# Execution Boundary & Controlled Action Policy

## Overview

ProjectMind executes modifications to repositories and environments solely through the Controlled Execution Engine (Phase 5.6) governed by policy and autonomy constraints.

## Controlled Tools

All actions map to strictly sandbox-constrained tools:
- `WRITE_FILE`: Writes or modifies code files, enforcing path bounds within the workspace root.
- `DELETE_FILE`: Removes files only when explicitly approved.
- `EXECUTE_COMMAND`: Runs validated shell commands with timeout guards, secret masking, and disallowed command lists.
- `APPLY_PATCH`: Performs atomic, reversible Git patch operations.

## Plan Freshness Validation

Prior to executing any `ActionPlan`, the `PlanFreshnessValidator` compares target resources against the baseline state recorded at planning time:
- Resource Content Hash Check: If the file was modified concurrently, execution aborts with `PlanFreshnessError`.
- Modification Timestamp Check: If `lastModified > plan.createdAt`, replanning is mandated.

## Dry Run Execution

When `dryRun: true` is passed in `AgentRequest`:
- Tool invocations simulate operations without mutating files on disk.
- Changesets are reported as virtual diffs in `AgentResponse.changedResources`.
