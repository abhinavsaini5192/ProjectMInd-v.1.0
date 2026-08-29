# File Formats and Schemas

This document defines the exact file structure of the `.projectmind` directory and the strict JSON schemas for every file within it.

## 1. Directory Structure

```text
.projectmind/
├── state.json             # Global state and metadata
├── graph.json             # Deterministic structural graph
├── history.jsonl          # Time-series semantic summaries
├── context.md             # The output manifest for AI Agents
├── .gitignore             # To ignore transient/lock files
├── update.lock            # Lockfile for concurrency
└── snapshots/             # Backups and historical state
    ├── snapshot_a1b2c3.zip
    └── consolidated_history.md
```

## 2. File Schemas

### 2.1 `state.json`
* **Purpose:** Stores lightweight metadata and version pointers.
* **Schema (TypeScript Representation):**
```typescript
interface StateFile {
  schema_version: "1.0.0";
  project_name: string;
  created_at: string; // ISO 8601
  last_update_timestamp: string; // ISO 8601
  last_commit_hash: string;
  total_commits_processed: number;
}
```

### 2.2 `graph.json`
* **Purpose:** The master storage for the structural graph.
* **Schema (TypeScript Representation):**
```typescript
interface GraphFile {
  schema_version: "1.0.0";
  nodes: {
    [nodeId: string]: {
      id: string;          // e.g., "file:src/main.ts" or "func:auth.login"
      type: "file" | "class" | "function" | "interface" | "export";
      name: string;
      file_path: string;
      start_line: number;
      end_line: number;
      metadata: Record<string, any>; // e.g., { "is_async": true }
    }
  };
  edges: {
    [edgeId: string]: {    // edgeId is ideally `${source}->${target}`
      source: string;      // nodeId
      target: string;      // nodeId
      type: "contains" | "imports" | "calls" | "implements" | "inherits";
    }
  };
}
```

### 2.3 `history.jsonl`
* **Purpose:** Append-only log of semantic diffs.
* **Format:** Each line is a valid JSON object.
* **Line Schema (TypeScript Representation):**
```typescript
interface HistoryEntry {
  timestamp: string; // ISO 8601
  commit_hash_from: string;
  commit_hash_to: string;
  summary: string;
  architectural_impact: string;
  tasks_completed: string[];
  decisions: Array<{topic: string; decision: string; rationale: string}>;
}
```

### 2.4 `context.md`
* **Purpose:** A Markdown file. No strict schema, but must follow a standard template.
* **Template Structure:**
  1. Title & Timestamp
  2. Core Architecture Summary (Derived from graph root nodes)
  3. Active Context (Derived from recent history)
  4. Recent Decisions (Derived from history decisions array)
  5. Directory/Module Map (Derived from graph file nodes)

## 3. `.gitignore` Rules
ProjectMind must include a `.gitignore` inside `.projectmind/` to ensure lock files are never committed to the parent Git repository.
```text
# .projectmind/.gitignore
update.lock
*.tmp
```

---

### Definition of Done Checklist
- [x] Functional Done: Lists every file present in the `.projectmind` directory.
- [x] Architectural Done: Defines strict, implementable schemas (TypeScript interfaces) for JSON structures.
- [x] AI-Ready Done: Covers edge cases like `.gitignore` and lock files to prevent repo pollution.
