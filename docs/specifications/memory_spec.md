# Memory Specification

This document outlines the operational rules for the ProjectMind persistence layer, dictating how memory is updated, versioned, merged, and recovered.

## 1. Ownership & Principles

* **Single Source of Truth:** The `.projectmind` directory is the single source of truth for the project's semantic and structural memory.
* **Append-Only History:** Semantic summaries are append-only. They are never rewritten, only consolidated or superseded by newer entries.
* **Deterministic Graph:** The structural graph is mutable but strictly deterministic. If you re-parse the entire repository from scratch at commit `X`, the resulting graph must be byte-for-byte identical to a graph updated incrementally up to commit `X`.

## 2. Update Rules

When a new `SemanticDiff` and `StructuralGraphDiff` arrive:
1. **Validation:** Both payloads must pass schema validation.
2. **Graph Application:** `StructuralGraphDiff.nodes_removed` and `edges_removed` are processed first, deleting entities from the graph. Then `nodes_added` and `edges_added` are applied.
3. **History Append:** The `SemanticDiff` is appended to `history.jsonl` (JSON Lines format) with a timestamp and commit hash.
4. **Context Regeneration:** `context.md` is regenerated based on the new graph and recent history.

## 3. Versioning

ProjectMind memory state is tightly coupled to the Git commit graph. 
* Every update transaction records the `commit_hash_from` and `commit_hash_to`.
* ProjectMind does not maintain its own independent version control system; it maps its state directly to Git hashes.

## 4. Snapshot Strategy

To prevent the `.projectmind` directory from growing unboundedly and to allow fast recovery:
* **Frequency:** A full snapshot of the graph and consolidated history is taken every 100 updates, or when `.projectmind/history.jsonl` exceeds 5MB.
* **Mechanism:** The current `graph.json` and a consolidated summary of `history.jsonl` are zipped and stored in `.projectmind/snapshots/snapshot_<commit_hash>.zip`.
* **Pruning:** `history.jsonl` is truncated, retaining only the semantic summaries that occurred *after* the snapshot commit hash. The consolidated summary is stored in a permanent `consolidated_history.md`.

## 5. Merge Strategy (Conflict Resolution)

Because `.projectmind` exists inside the Git repository, Git merges can cause conflicts in `.projectmind` files.
**Rule:** ProjectMind completely ignores Git merge conflicts within its own directory. 
* If a Git merge conflict occurs in `.projectmind/state.json` or `.projectmind/graph.json`, human developers should **not** manually resolve them.
* Instead, the human resolves the *code* conflicts and commits the merge.
* Then, they run `projectmind update --rebuild`.
* **Rebuild Mechanism:** The `memory-manager` detects a corrupted/conflicted state, discards the current `graph.json`, and triggers a full deterministic re-extraction of the current codebase to rebuild `graph.json` from scratch. History is preserved where possible.

## 6. Recovery Strategy

If the `.projectmind` directory becomes corrupted (e.g., interrupted write, invalid JSON):
1. The `memory-manager` detects invalid JSON on initialization.
2. It immediately renames `.projectmind` to `.projectmind_corrupted_<timestamp>`.
3. It initializes a fresh `.projectmind` directory.
4. It performs a full repository extraction (like Milestone 1) to rebuild the structural graph.
5. *Note:* Semantic history is lost in a total corruption event unless recovered from a snapshot.

---

### Definition of Done Checklist
- [x] Functional Done: Defines update rules, versioning, snapshotting, merging, and recovery.
- [x] Architectural Done: Establishes the relationship between ProjectMind state and Git state.
- [x] AI-Ready Done: Provides unambiguous instructions on how to handle Git merge conflicts in the `.projectmind` directory (discard and rebuild).
