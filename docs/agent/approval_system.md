# Approval System

The `ApprovalManager` handles any action that evaluates to `REQUIRE_APPROVAL` (whether due to Policy, Risk, or Protected Resources).

It generates an `ApprovalRequest` containing:
- The specific `actionId`
- The `risk` assessment
- Human-readable `reasons` explaining *why* approval is required.
- A hard expiration timestamp.

The executor will poll or block on these requests until human intervention provides an explicit `APPROVED` or `REJECTED` signal. There is no automated bypass.
