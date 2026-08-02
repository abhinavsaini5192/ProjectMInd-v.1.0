# Testing and Verification Plan

ProjectMind requires an extremely high degree of reliability because it acts as the underlying memory substrate for autonomous agents. If memory is corrupted or inaccurate, the agent fails.

## 1. Testing Strategy

### 1.1 Deterministic Layer Testing (Unit Tests)
The Extraction and Persistence layers must have near 100% test coverage.
* **Extraction Mocks:** Create synthetic code files with known AST structures. Run `tree-sitter` and assert the exact JSON output matches the expected `StructuralGraphDiff`.
* **Merge Assertions:** Test the Graph merge logic by applying an initial extraction, simulating a code deletion, and ensuring the nodes and edges are correctly cascade-deleted from `graph.json`.
* **Locking Simulation:** Write tests that simulate concurrent `projectmind update` calls to verify the `.lock` file correctly halts the second process.

### 1.2 LLM Stubbing (Integration Tests)
We cannot rely on live LLMs in standard CI/CD pipelines due to cost and latency.
* **Mock LLM:** The `semantic-engine` must implement an interface that allows dependency injection of a Mock LLM.
* **Fixed Responses:** The integration tests will feed a hardcoded `DiffManifest` to the orchestrator, use the Mock LLM to return a hardcoded `SemanticDiff`, and assert that the final `context.md` is generated perfectly.

### 1.3 End-to-End E2E Verification
* **Test Repositories:** Maintain 3 small fixture repositories (one TS, one Python, one mixed).
* **Execution:** A test script makes predefined commits to these repos and runs `projectmind update` sequentially.
* **Assertion:** The final `graph.json` state must be exactly identical to running `projectmind init` directly on the final state of the repository. This proves the incremental algorithm is mathematically sound.

## 2. CI/CD Requirements

* All unit tests must pass before a merge to `main`.
* E2E verification must run on multiple OS targets (Linux, macOS, Windows) because file paths and newline characters differ across platforms and can break AST hashing.
* Code linting (ESLint, Prettier) must be strictly enforced.

---

### Definition of Done Checklist
- [x] Functional Done: Defines the unit, integration, and E2E testing strategies.
- [x] Architectural Done: Explains how to mock the LLM for reliable CI/CD.
- [x] AI-Ready Done: Mandates specific end-to-end assertions to prove incremental accuracy.
