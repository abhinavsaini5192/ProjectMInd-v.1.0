# Structural Graph Specification

This document details how the Extraction Layer represents source code as a deterministic graph inside `graph.json`. 

## 1. Node Taxonomy

Nodes represent physical or logical entities in the codebase.

* **`file`**: A physical file on disk (e.g., `src/auth.ts`).
* **`class`**: A class definition.
* **`interface`**: An interface or type definition.
* **`function`**: A standalone function or a class method.
* **`variable`**: A globally exported constant or variable.

### Node ID Convention
To ensure deterministic updates, node IDs must be globally unique and reproducibly generated.
* Format: `<type>:<filepath>#<local_name>`
* Example 1: `file:src/auth/login.ts`
* Example 2: `class:src/auth/login.ts#AuthService`
* Example 3: `function:src/auth/login.ts#AuthService.authenticate`

## 2. Edge Taxonomy

Edges represent relationships between nodes. They are directed (`source` -> `target`).

* **`contains`**: Represents physical hierarchy.
  * Source: `file` or `class`
  * Target: `class`, `function`, or `interface`
  * Example: `file:src/main.ts` -> `contains` -> `function:src/main.ts#main`
* **`imports`**: Represents file-level dependencies.
  * Source: `file`
  * Target: `file`
* **`calls`**: Represents function invocation.
  * Source: `function`
  * Target: `function`
* **`inherits`**: Class inheritance.
  * Source: `class`
  * Target: `class`
* **`implements`**: Interface implementation.
  * Source: `class`
  * Target: `interface`

## 3. Graph Mutation Rules

Because the graph is updated incrementally via diffs, we must define rules for mutations.

### 3.1 Node Addition
* Triggered when a new class/function is detected in a `tree-sitter` parse of a modified/added file.
* Rule: If the Node ID already exists, overwrite its metadata (e.g., lines might have shifted). If it does not exist, insert it.

### 3.2 Node Removal
* Triggered when an existing Node ID is no longer present in the newly parsed AST of a file.
* Rule: Delete the node. **Cascade Delete**: Automatically delete all edges where this node is the `source` or `target`.

### 3.3 Edge Updates
* Edges are strictly recalculated for the modified files.
* If `file A` is modified, we delete all `calls` and `imports` edges originating from `file A` or its children, and re-insert the ones found in the new AST.
* We do *not* recalculate edges originating from unmodified files, ensuring $O(k)$ time complexity where $k$ is the size of the diff.

## 4. Sub-graphs and Pruning

To keep `graph.json` performant:
* **Exclusions:** We do not index `node_modules`, `.venv`, `vendor`, or generated build directories. These must be configurable via a `.projectmindignore` file.
* **Granularity:** We do not index local variables inside a function body. We only index module-level and class-level definitions.

---

### Definition of Done Checklist
- [x] Functional Done: Defines the Node and Edge taxonomy for the structural graph.
- [x] Architectural Done: Establishes a deterministic Node ID convention.
- [x] AI-Ready Done: Explicitly documents graph mutation rules (Cascade Deletes, edge recalculation) required for incremental updates.
