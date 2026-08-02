# Roadmap

This roadmap outlines the milestones and iterative phases for implementing ProjectMind. The development is structured to validate core assumptions early (deterministic parsing) before moving to complex semantic memory and multi-agent coordination.

## Milestone 1: The Deterministic Foundation (Extraction Layer)
**Goal:** Prove that we can incrementally extract the structural graph of a project from Git diffs without using AI.

* **Core Engine:** Initialize the `.projectmind` repository state.
* **AST Parsers:** Implement deterministic parsers for Python and TypeScript using tools like `tree-sitter`.
* **Graph Generation:** Extract classes, functions, and imports into a local, queryable graph (JSON structure).
* **Incremental Diff Processing:** Given a `git diff`, update only the affected nodes in the graph.
* **CLI Interface:** `projectmind init` and `projectmind update`.

## Milestone 2: Semantic Summarization (Understanding Layer)
**Goal:** Layer AI on top of the deterministic graph to extract intent, design decisions, and architectural shifts.

* **Local LLM Integration:** Connect ProjectMind to a lightweight local model (e.g., Llama 3 8B or similar quantized models) via an API abstraction.
* **Diff Summarization:** For every commit/diff, the LLM generates a semantic summary of *what* feature was built and *why*.
* **Memory Consolidation:** Merge small incremental summaries into higher-level module summaries to prevent context bloat.
* **Context Generation:** Provide an endpoint to output a "Context Manifest" (a highly compressed markdown string summarizing the whole project) for consumption by primary coding agents.

## Milestone 3: Persistence and Conflict Resolution
**Goal:** Ensure the memory store is robust, versioned, and capable of handling edge cases.

* **Snapshotting:** Implement periodic state snapshots to prevent corruption of the `.projectmind` directory.
* **Conflict Resolution:** If ProjectMind fails to update (e.g., due to a crash), implement a fallback mechanism to re-sync the state with the current Git `HEAD`.
* **Git Hook Integration:** Automatically run `projectmind update` on `post-commit` and `post-merge`.

## Milestone 4: Advanced AI Integrations
**Goal:** Enhance the consumption of ProjectMind data by external agents.

* **Vector Search:** Embed the semantic summaries into a local vector database for deep RAG (Retrieval-Augmented Generation).
* **Agent API:** Create a REST/Local socket API so external AI coding agents can query ProjectMind directly instead of parsing flat files.
* **Task Tracking:** Allow the Understanding layer to detect when a predefined task is "Completed" based on the semantic analysis of a diff.

## Milestone 5: The Ubiquitous Standard
**Goal:** Language expansion and ecosystem integration.

* **Multi-Language Support:** Expand `tree-sitter` integration to support Rust, Go, Java, C++, Ruby, etc.
* **IDE Plugins:** Build VS Code and JetBrains extensions that visualize the ProjectMind graph and semantic state for human developers.
* **Swarm Ready:** Support concurrent reads/writes for environments where multiple AI agents are working on the same repository simultaneously.

---

### Definition of Done Checklist
- [x] Functional Done: Outlines a clear, multi-milestone path from MVP to future state.
- [x] Architectural Done: Maps milestones to the 3 core layers defined in the architecture.
- [x] AI-Ready Done: Provides actionable steps for an implementation agent to follow chronologically. No TBDs.
