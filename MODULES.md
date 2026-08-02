# Modules Definition

This document defines every functional module within ProjectMind. Every module operates with strict isolation, defined inputs, and outputs.

## 1. `projectmind-cli` (CLI Entrypoint)
* **Purpose:** The primary interface for triggering ProjectMind workflows.
* **Responsibilities:** Parse command-line arguments (`init`, `update`, `context`, `status`), validate environment, and invoke the orchestrator.
* **Non-responsibilities:** Does not perform any business logic.
* **Inputs:** STDIN args (e.g., `projectmind update --cwd .`).
* **Outputs:** STDOUT logs, exit codes (0 for success, >0 for failure).
* **Dependencies:** None.

## 2. `orchestrator` (The Coordinator)
* **Purpose:** Manages the lifecycle defined in `LIFECYCLE.md`.
* **Responsibilities:** Sequentially calls the Git Watcher, Extraction Layer, Understanding Layer, and Persistence Layer. Handles top-level error catching and fallback execution.
* **Non-responsibilities:** Does not parse code or interact with the LLM directly.
* **Inputs:** Action triggers (e.g., `run_update()`).
* **Outputs:** Success/Failure boolean.
* **Dependencies:** `git-watcher`, `extractor`, `semantic-engine`, `memory-manager`.

## 3. `git-watcher` (Diff Engine)
* **Purpose:** Bridges Git and ProjectMind.
* **Responsibilities:** Determines what changed since the last ProjectMind update. Executes `git diff` against the last known commit hash stored in `.projectmind/state.json`.
* **Non-responsibilities:** Does not parse the contents of the files, only identifies paths and raw diff chunks.
* **Inputs:** CWD, last known commit hash.
* **Outputs:** `DiffManifest` (Array of changed file paths, status [Added, Modified, Deleted], and raw text diffs).
* **Dependencies:** System Git binary.

## 4. `extractor` (Extraction Layer Core)
* **Purpose:** Orchestrates language-specific parsers.
* **Responsibilities:** Maps file extensions in `DiffManifest` to the correct parser. Aggregates the results into a single `StructuralGraphDiff`.
* **Non-responsibilities:** Does not analyze the semantic meaning of the code.
* **Inputs:** `DiffManifest`.
* **Outputs:** `StructuralGraphDiff` (JSON schema representing added/removed nodes and edges).
* **Internal Components:** `parser-registry`.
* **Dependencies:** `tree-sitter` bindings.
* **Future Extension Points:** Plugin system for new languages.

## 5. `semantic-engine` (Understanding Layer Core)
* **Purpose:** Bridges the deterministic graph with an LLM.
* **Responsibilities:** Constructs prompts using the `StructuralGraphDiff` and raw code diffs. Calls the LLM interface. Parses the LLM response into a structured `SemanticDiff`.
* **Non-responsibilities:** Does not maintain conversation history (stateless).
* **Inputs:** `StructuralGraphDiff`, `DiffManifest`.
* **Outputs:** `SemanticDiff` (JSON schema containing modular summaries and architectural impact tags).
* **Internal Components:** `prompt-builder`, `llm-client`.
* **Dependencies:** Local LLM endpoint or API client (OpenAI/Anthropic/Local).

## 6. `memory-manager` (Persistence Layer Core)
* **Purpose:** Controls read/write access to `.projectmind`.
* **Responsibilities:** Read existing state, apply the `StructuralGraphDiff` to the local graph DB (JSON), append `SemanticDiff` to the history log, update indexes, and generate the final `ContextManifest`.
* **Non-responsibilities:** Does not determine *what* the changes mean, only persists them.
* **Inputs:** `StructuralGraphDiff`, `SemanticDiff`.
* **Outputs:** Updated `.projectmind` directory state, `ContextManifest` string.
* **Internal Components:** `file-locker`, `snapshotter`, `merger`.
* **Dependencies:** File system API.

## 7. `context-generator`
* **Purpose:** Formats the internal state into a highly optimized Markdown string for AI consumption.
* **Responsibilities:** Reads the current graph and semantic summaries from the `memory-manager` and compiles them into `context.md` based on predefined templates.
* **Inputs:** Global graph state, active task state.
* **Outputs:** Markdown string.
* **Dependencies:** `memory-manager`.

---

### Definition of Done Checklist
- [x] Functional Done: All core modules for Extraction, Understanding, and Persistence are defined.
- [x] Architectural Done: Inputs, Outputs, and Responsibilities are strictly bounded to prevent overlap.
- [x] AI-Ready Done: Clear dependency tree defined. Future extension points are noted. No TBDs.
