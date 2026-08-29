# Data Flow Specification

This document details the precise data structures, schemas, and routing paths that flow through ProjectMind v2.0. By enforcing strict boundaries via the **Workspace API**, we ensure deterministic behavior and complete isolation of the persistence layer.

## 1. High-Level Runtime Flow

When an AI Agent or User invokes ProjectMind in a repository, the execution follows a strict initialization and resolution flow before data extraction begins.

```mermaid
graph TD
    A[Repository Request] -->|Reads| B[.projectmind.json (Pointer)]
    B -->|Provides UUID| C(WorkspaceManager)
    C -->|Queries| D[(WorkspaceRegistry)]
    D -->|Resolves Path| E[Target Workspace]
    
    subgraph Data Extraction Pipeline
        E --> F(Workspace API)
        F --> G(Extraction Engine)
        F --> H(Semantic Engine)
    end
    
    subgraph Storage Abstraction Layer
        G -->|Upsert Nodes| I[(IKnowledgeStore / KuzuDB)]
        H -->|Append Log| J[(IMemoryStore / SQLite)]
    end
    
    I -->|Graph Data| K(ContextGenerator)
    J -->|Intent Data| K
    K -->|Generate| L[ContextManifest]
    L --> M[AI Agent]
```

## 2. The Resolution Phase

1. **Invocation:** `projectmind update` runs in `/repo/my-project`.
2. **Pointer Check:** System reads `/repo/my-project/.projectmind.json`.
3. **Identity Verification:** Extracts `repositoryId`.
4. **Locator Phase:** `WorkspaceLocator` queries the OS-specific path (e.g., `%LOCALAPPDATA%/ProjectMind/registry/registry.db`) for the given UUID.
5. **Validation:** `WorkspaceHealthMonitor` verifies the registry entry points to a valid workspace directory.

## 3. Data Contracts

The payloads flowing between the Kernel engines and the Workspace API remain immutable and deterministic.

### 3.1 DiffManifest (JSON)
* **Origin:** `git-watcher`
* **Destination:** `Extraction Engine`, `Semantic Engine`
* **Purpose:** Represents the physical file changes.

### 3.2 StructuralGraphDiff (JSON)
* **Origin:** `Extraction Engine`
* **Destination:** `KnowledgeService` (Workspace API)
* **Purpose:** Represents the abstract syntactic changes.
* **Schema:**
```json
{
  "nodes_added": [
    {"id": "func:auth.login", "type": "function", "file": "auth.ts"}
  ],
  "edges_added": [
    {"source": "func:app.main", "target": "func:auth.login", "type": "calls"}
  ]
}
```
* **Routing:** The `KnowledgeService` routes this payload through the `IKnowledgeStore` interface, which translates it into Cypher queries for KuzuDB.

### 3.3 SemanticLogEntry (JSON)
* **Origin:** `Semantic Engine`
* **Destination:** `MemoryService` (Workspace API)
* **Purpose:** Represents the LLM-derived understanding of the changes.
* **Schema:**
```json
{
  "timestamp": "2026-08-04T12:00:00Z",
  "intent_summary": "Migrated legacy login to JWT.",
  "tasks_completed": ["TICK-102"]
}
```
* **Routing:** The `MemoryService` translates this into an insert statement for the SQLite database via the `IMemoryStore` interface.

### 3.4 ContextManifest (Markdown)
* **Origin:** `ContextService` (Workspace API)
* **Destination:** Written to `workspaces/<uuid>/context/context.md`
* **Purpose:** The final, highly compressed markdown file read by external AI Agents.

## 4. Immutability & Validation

* All API payloads are validated using JSON Schema/Zod before hitting the Storage Abstraction Layer.
* If a database error occurs (e.g., KuzuDB constraint violation), it is caught by the Storage Implementation, wrapped in a `WorkspaceError`, and returned through the Workspace API. The kernel never sees raw DB errors.

---

### Definition of Done Checklist
- [x] Functional Done: Traces the new runtime flow starting from the Pointer File.
- [x] Architectural Done: Explicitly routes data through the Workspace API and SAL.
- [x] AI-Ready Done: Schemas and routing logic are unambiguous.
