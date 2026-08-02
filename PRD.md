# Product Requirements Document (PRD)

## 1. Problem Statement
Current AI coding agents operate statelessly or with highly volatile, finite context windows. When an AI agent connects to a repository, it must ingest massive amounts of raw source code to understand the project's architecture, conventions, dependencies, and state. 
This approach is fundamentally flawed because it wastes tokens, increases latency, degrades reasoning quality over time, and forces the AI to infer implicit design decisions repeatedly. The AI forgets why a decision was made the moment its context window resets.

## 2. Existing Limitations
* **Token Exhaustion:** Feeding entire repositories or large directories into LLMs frequently hits context limits.
* **Redundant Computation:** Re-parsing the same static files across multiple agent sessions is inefficient.
* **Loss of Intent:** Git tracks *what* changed, not *why* it changed from an architectural or semantic perspective.
* **Context Fragmentation:** RAG (Retrieval-Augmented Generation) based on naive embeddings often retrieves irrelevant files and misses critical architectural connections.

## 3. Product Vision
ProjectMind serves as the long-term memory cortex for AI software development. We envision a world where a codebase is not just a collection of text files, but a living, queryable graph of intent, structure, and state. ProjectMind bridges the gap between static software repositories and dynamic AI agents by maintaining a continuously updated, structured representation of the project that agents can instantly consume.

## 4. Design Philosophy
* **Deterministic Over Probabilistic:** Structural extraction (AST parsing, dependency mapping) must be 100% deterministic. LLMs should only be used for semantic summarization and intent extraction.
* **Incremental by Default:** The system must update its state exclusively via diffs. Full rescans are an anti-pattern.
* **AI as a Consumer:** Output data structures (JSON, Markdown, Graphs) must be optimized for LLM consumption (token-efficient, high signal-to-noise ratio).
* **Decoupled:** The coding agent writes code; ProjectMind observes, structures, and remembers.

## 5. Goals
* Provide an instantaneous, token-efficient summary of the entire project state to any new AI agent session.
* Track architectural decisions, open tasks, and feature progress chronologically.
* Operate locally and offline-first without requiring external cloud databases.
* Resolve merge conflicts in the memory state deterministically.

## 6. Non-Goals
* **Code Generation:** ProjectMind does *not* write code. It only observes and records.
* **Replacing Git:** ProjectMind runs alongside Git; it is not a version control system for source code, but for project semantic memory.
* **Human-First UI:** While human-readable, the primary consumer of `.projectmind` is an AI agent. We will not build complex GUIs for humans.

## 7. Target Users
1. **AI Coding Agents (Primary):** The automated systems that read `.projectmind` to gain instant context before writing code.
2. **AI Framework Developers:** Engineers building the next generation of AI coding assistants.
3. **Human Developers (Secondary):** Engineers who occasionally read the memory files to understand the AI's perspective on the project.

## 8. Success Metrics
* **Token Reduction:** 80% reduction in tokens required to onboard an AI agent to a codebase.
* **Latency:** ProjectMind state updates must complete in under 5 seconds for a standard Git diff.
* **Accuracy:** 0% hallucination rate in the deterministic Extraction and Persistence layers.
* **Agent Continuity:** Agents must successfully resume complex, multi-day refactoring tasks without losing context of design decisions.

## 9. MVP Scope
* **Extraction:** Deterministic AST parsing for Python and TypeScript. Extraction of functions, classes, and dependencies from `git diff`.
* **Understanding:** Integration with a local LLM to generate semantic summaries of changed files.
* **Persistence:** A file-based knowledge base stored in `.projectmind/` containing JSON state files and Markdown summaries.
* **API/CLI:** A CLI to trigger memory updates based on the current working directory's Git state.

## 10. Future Scope
* Multi-language support (Go, Rust, Java, C++, etc.).
* Distributed project memory for multi-agent swarm collaboration.
* Vector embeddings of semantic summaries for deep semantic search.
* Real-time IDE integration (LSP integration).

## 11. Risks
* **State Divergence:** If ProjectMind fails to run after a commit, its memory may diverge from the actual codebase. (Mitigation: Git hook integration).
* **LLM Latency:** The Understanding Layer's local LLM might be too slow for real-time workflows. (Mitigation: Use highly quantized, specialized small models).
* **Context Bloat:** The memory files themselves might grow too large for the context window. (Mitigation: Implement aggressive pruning, snapshotting, and hierarchical summarization).

## 12. Constraints
* The entire system must run on standard developer hardware (e.g., M1 Mac with 16GB RAM) without impacting the performance of the IDE or the primary coding agent.
* The Persistence Layer cannot use a heavy relational database server (like PostgreSQL); it must rely on flat files (JSON/Markdown) or embedded databases (like SQLite) stored in `.projectmind`.

---

### Definition of Done Checklist
- [x] Functional Done: All required PRD sections (Problem, Vision, Goals, MVP, etc.) are present and clearly defined.
- [x] Architectural Done: Delineates what the system does (memory engine) versus what it doesn't do (code generation).
- [x] AI-Ready Done: Explicitly lists MVP vs Future Scope, minimizing ambiguity for implementing agents.
