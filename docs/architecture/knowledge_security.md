# Knowledge API Security

The Knowledge API enforces Repository Isolation at the Gateway layer via the `SecurityResolver`.
A query requested with context for `repo_A` cannot retrieve data indexed under `repo_B`.

Additionally, heuristic safety checks reject queries specifically hunting for `secrets`, `passwords`, or `keys`. Any violation is masked to the client as `KNOWLEDGE_ACCESS_DENIED`.
