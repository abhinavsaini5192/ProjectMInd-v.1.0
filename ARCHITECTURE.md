# Architecture Specification

## 1. System Overview

ProjectMind operates as a local, sidecar process that monitors a codebase and maintains a `.projectmind` state directory. The system is designed to be highly decoupled from the primary AI coding agent. The agent mutates the codebase; ProjectMind observes the changes, understands them, and persists the new state.

The system is strictly divided into three layers, connected by well-defined data contracts (JSON/Markdown schemas):

1. **Extraction Layer**: The deterministic foundation. Parses code and extracts structural facts.
2. **Understanding Layer**: The semantic engine. Uses LLMs to infer intent from structural facts and code diffs.
3. **Persistence Layer**: The memory manager. Safely reads and writes to the `.projectmind` directory, handling concurrency and history.

## 2. Layer Definitions

### 2.1 Extraction Layer (Deterministic)
The Extraction Layer is entirely deterministic. It takes source code and Git diffs as input and outputs a structured representation of the code. **No LLMs are permitted in this layer.**

**Core Responsibilities:**
* Interface with Git to obtain `git diff` outputs.
* Route changed files to language-specific parsers (e.g., `tree-sitter-python`, `tree-sitter-typescript`).
* Parse files into Abstract Syntax Trees (ASTs).
* Extract defined entities: Classes, Functions, Interfaces, Variables, Imports, Exports.
* Resolve intra-project dependencies (e.g., File A imports File B).
* Generate a deterministic JSON representation of the "Structural Graph Diff".

### 2.2 Understanding Layer (Probabilistic/Semantic)
The Understanding Layer takes the "Structural Graph Diff" and the raw code diffs from the Extraction layer, and combines them using a local Language Model to generate semantic insights. 

**Core Responsibilities:**
* Accept structural diffs from the Extraction Layer.
* Query a lightweight LLM (local or API) with specific prompts tailored for summarization.
* Identify *intent* (e.g., "Developer refactored authentication module to use JWT").
* Detect task progress (e.g., "Feature XYZ is now complete").
* Generate a "Semantic Diff" containing natural language summaries of the changes.

### 2.3 Persistence Layer (State Management)
The Persistence Layer is the only layer authorized to read from and write to the `.projectmind` directory. It takes the "Structural Graph Diff" and the "Semantic Diff", and merges them into the persistent global state.

**Core Responsibilities:**
* Maintain the physical structure of `.projectmind` (JSON indexes, Markdown files, embedded graph DBs).
* Perform deterministic graph merges (e.g., replacing node A with node A').
* Snapshot previous states for recovery.
* Handle file locking to prevent corruption from concurrent updates.
* Generate the "Context Manifest" (the final output read by external AI agents).

## 3. Architecture Constraints

1. **Unidirectional Data Flow**: Data flows strictly from Extraction -> Understanding -> Persistence. The Extraction Layer must never call the Understanding Layer. 
2. **Fail-Safe Operation**: If ProjectMind fails to parse a file or the LLM times out, it must log an error and safely abort the update without corrupting the `.projectmind` state. 
3. **Stateless Processing**: The Extraction and Understanding layers must be completely stateless. They rely entirely on the data provided by Git and the Persistence layer.

## 4. Key Architectural Decisions

* **Decision**: Use `tree-sitter` for the Extraction Layer instead of Regex or LLMs.
  * **Justification**: Regex is too fragile for complex syntax. LLMs hallucinate dependencies. `tree-sitter` is fast, deterministic, and supports incremental parsing.
* **Decision**: Store state in flat files (`.json`, `.md`) instead of a relational DB like PostgreSQL.
  * **Justification**: ProjectMind must be zero-configuration and easily commit-able via Git. A heavy database daemon violates the local, portable nature of the tool.
* **Decision**: The output context is plain Markdown.
  * **Justification**: Primary AI agents natively process Markdown exceptionally well. It is token-efficient and easily chunked.

---

### Definition of Done Checklist
- [x] Functional Done: Describes the 3 major layers in detail and constraints.
- [x] Architectural Done: Explicitly isolates determinism from probabilistic operations. Defines unidirectional data flow.
- [x] AI-Ready Done: Documents architectural decisions and justifications clearly. No TBDs.
