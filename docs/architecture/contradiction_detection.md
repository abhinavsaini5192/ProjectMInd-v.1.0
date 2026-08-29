# Contradiction Detection

The Context Graph is scanned for logical contradictions before the Pack is finalized.

Example Contradictions:
- Feature A's Context requires Dependency B, but an Architecture Rule explicitly bans Feature A from accessing Dependency B.
- A Bug Fix task targets Symbol C, but History shows Symbol C was deprecated and superseded by Symbol D last week.

When detected, these are appended to the `ContextPack` as explicit `ContextWarnings`, immediately alerting the SLM that the task requirements are logically flawed.
