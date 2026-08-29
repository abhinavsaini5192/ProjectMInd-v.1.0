# Brain Query System

The `BrainQueryEngine` acts as the bridge between the Brain's reasoning loop and ProjectMind's foundational knowledge layers.

Instead of reading raw file contents, the Brain issues semantic queries:
- `findDependencies('AuthService')`
- `findArchitecture('SecurityLayer')`
- `findMemory('AuthService')`

This forces the SLM to operate on structured, verified facts rather than parsing massive strings of arbitrary source code.
