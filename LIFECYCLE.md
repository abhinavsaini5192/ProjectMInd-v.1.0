# Execution Lifecycle

This document defines the end-to-end execution lifecycle, tracing the path from a user's prompt down to the final context generation.

## 1. The Outer Loop (The AI Agent Session)

ProjectMind is a background engine. The primary actor is the **AI Coding Agent** (e.g., Cursor, an autonomous dev agent, or a CLI copilot).

1. **User Prompt:** The human user issues a prompt to the AI Agent (e.g., "Refactor the authentication module").
2. **Context Ingestion:** Before taking action, the AI Agent reads `.projectmind/context.md` (generated previously by ProjectMind) to understand the codebase.
3. **Execution:** The AI Agent edits files and completes the task.
4. **Commit:** The AI Agent (or human) commits the changes to Git.

## 2. The Inner Loop (ProjectMind Execution)

Once a commit is made (or a manual `projectmind update` command is run), the ProjectMind inner loop triggers.

### Phase 1: Initiation
1. The `projectmind-cli` is invoked.
2. The `orchestrator` locks the `.projectmind` directory to prevent race conditions.
3. The `git-watcher` is queried. It compares the current Git state against the `last_commit_hash` stored in ProjectMind memory.
4. `git-watcher` outputs the `DiffManifest`.

### Phase 2: Deterministic Extraction
1. The `extractor` receives the `DiffManifest`.
2. It filters out unsupported files (e.g., images, binaries).
3. It routes supported files (e.g., `.ts`, `.py`) to their respective `tree-sitter` parsers.
4. The parser constructs an AST and extracts entities (Classes, Functions) and relationships (Imports, Calls).
5. The `extractor` calculates the delta between the old AST facts and the new AST facts, producing the `StructuralGraphDiff`.

### Phase 3: Semantic Understanding
1. The `semantic-engine` receives both the `DiffManifest` (raw code) and the `StructuralGraphDiff` (clean structural facts).
2. It constructs an LLM prompt:
   * *"You are analyzing a codebase update. The following structures changed: [StructuralGraphDiff]. The raw code diff is: [DiffManifest]. Summarize the architectural intent."*
3. The LLM processes the prompt and returns a JSON response.
4. The `semantic-engine` validates the response and outputs the `SemanticDiff`.

### Phase 4: Memory Persistence
1. The `memory-manager` receives the `StructuralGraphDiff` and `SemanticDiff`.
2. It loads the current master graph from `.projectmind/graph.json`.
3. It applies the `StructuralGraphDiff` mutations to the graph (adding/removing nodes and edges deterministically).
4. It appends the `SemanticDiff` to the `.projectmind/history.json` log.
5. It triggers the `context-generator`.

### Phase 5: Context Generation & Teardown
1. The `context-generator` queries the updated graph and history.
2. It uses a summarization heuristic to rewrite `.projectmind/context.md`. If the history is too long, it triggers a background LLM call to condense older history (Memory Consolidation).
3. The `memory-manager` writes the final `context.md`, updates `state.json` with the new `last_commit_hash`, and releases the file lock.
4. ProjectMind exits successfully.

## 3. Failure Handling Lifecycle

If any phase fails:
1. **Extraction Failure:** If `tree-sitter` crashes on a malformed file, the `extractor` flags the file as `UNPARSABLE`, skips it, and continues. The LLM handles the raw diff fallback.
2. **LLM Timeout:** If the `semantic-engine` times out, the `SemanticDiff` is generated as an empty object with a system note: `[LLM Offline - Structural Update Only]`. The system proceeds to Phase 4.
3. **Lock Contention:** If the `.projectmind` lock cannot be acquired within 10 seconds, the orchestrator aborts with a `Retry Later` exit code.

---

### Definition of Done Checklist
- [x] Functional Done: Maps the entire lifecycle from User Prompt to Context Generation.
- [x] Architectural Done: Connects the modules defined in `MODULES.md` into a chronological workflow.
- [x] AI-Ready Done: Explicitly documents failure handling pathways so implementers don't have to guess.
