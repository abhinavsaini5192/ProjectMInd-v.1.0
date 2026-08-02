# Update Specification

This document details exactly how incremental updates work in ProjectMind, ensuring that we never rescan the entire repository after initialization.

## 1. The Git Anchor

ProjectMind's internal state is anchored to a specific Git commit hash, stored in `state.json` under `last_commit_hash`. 

Whenever `projectmind update` runs, it asks Git:
`git diff <last_commit_hash> HEAD`

This produces the precise delta that ProjectMind needs to process. 

## 2. The Delta Processing Rules

### 2.1 Added Files
1. `tree-sitter` parses the entire new file.
2. All extracted nodes are added to the graph.
3. Edges representing intra-file dependencies (e.g., a file importing another file) are added.

### 2.2 Modified Files
1. `tree-sitter` parses the modified file.
2. The `extractor` queries the existing graph for all nodes originating from this `file_path`.
3. It compares the existing node list with the newly extracted node list.
4. **Nodes present in both (matched by ID):** Update their metadata (e.g., line numbers might have shifted).
5. **Nodes only in existing graph:** Delete them. Cascade delete their edges.
6. **Nodes only in new extraction:** Insert them.
7. Edges originating from this file are purged and recalculated entirely based on the new AST.

### 2.3 Deleted Files
1. `tree-sitter` is not invoked (the file is gone).
2. The `extractor` queries the existing graph for all nodes originating from this `file_path`.
3. It deletes all those nodes and cascade deletes their edges.

## 3. Resolving Cross-File Edges Incrementalism

The hardest part of incremental graph parsing is resolving edges that cross file boundaries (e.g., `File A` imports a function from `File B`, and `File B` was modified).

* **Rule of Lazy Evaluation:** When `File B` is modified and a function is deleted, ProjectMind performs a cascade delete of the edge from `File A`. However, it does *not* re-parse `File A` to see if `File A` is now broken. 
* **Justification:** ProjectMind is an observer, not a compiler or linter. If the human or AI broke the code, ProjectMind faithfully records the broken state. ProjectMind assumes the source code reflects reality, regardless of whether that reality compiles.

## 4. The Edge Case: Branch Switching

If a developer runs `git checkout old-branch`, the `git diff <last_commit_hash> HEAD` might produce a massive diff representing the "undoing" of hundreds of commits. 
* **Detection:** If the diff size exceeds a threshold (e.g., >20% of the codebase files changed), incrementalism becomes slower than a full rebuild.
* **Action:** The orchestrator aborts the incremental update, drops the graph, and triggers a full deterministic rebuild of the graph from the current `HEAD`. The semantic history is preserved, but appended with a system note: `[System Event: Branch checkout detected. Graph rebuilt.]`

---

### Definition of Done Checklist
- [x] Functional Done: Fully explains how Added, Modified, and Deleted files are processed incrementally.
- [x] Architectural Done: Explains the "Rule of Lazy Evaluation" to avoid cascading re-parses.
- [x] AI-Ready Done: Defines the critical threshold strategy for handling massive branch switches.
