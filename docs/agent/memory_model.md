# Memory Model

Memories are divided into three types:
1. **EPISODIC**: Historical logs of what happened (e.g., "Attempted to modify X on Tuesday").
2. **SEMANTIC**: Facts about the repository (e.g., "The auth service uses JWT").
3. **PROCEDURAL**: Learned processes (e.g., "To add a route, you must update the controller and the OpenAPI spec").

## Evidence
A memory cannot exist without `MemoryEvidence`. The system rejects hallucinatory candidates (e.g., a high-confidence SLM guess) unless they are backed by a concrete source (like a `TEST_RESULT` or `SOURCE_CODE`).
