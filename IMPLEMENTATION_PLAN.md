# Implementation Plan

This document breaks down the Engineering Blueprint into explicit, actionable tasks for an AI coding agent to execute.

## Phase 1: Setup & Initialization
1. Initialize a new Node.js / TypeScript project in `ProjectMind/`.
2. Configure `tsconfig.json` with strict typing enabled.
3. Install dependencies: `tree-sitter`, `tree-sitter-javascript`, `tree-sitter-typescript`, `tree-sitter-python`, `zod` (for schema validation), and a CLI framework like `commander`.
4. Create the core directory structure aligning with `MODULES.md` (e.g., `src/extractor/`, `src/memory/`).
5. Define all Zod schemas based on `DATA_FLOW.md` and `FILE_FORMATS.md`.

## Phase 2: Building `git-watcher`
1. Implement a function to execute `git diff` via `child_process`.
2. Parse the unified diff output.
3. Handle the edge case where there is no `last_commit_hash` (initialization phase: perform a full tree walk instead of a diff).
4. Return a `DiffManifest` object. Write a unit test using a mocked git repository.

## Phase 3: Building `extractor`
1. Initialize the `tree-sitter` parser instance.
2. Implement AST traversal to extract functions, classes, and their names.
3. Implement import resolution (extracting `import { x } from './y'`).
4. Build the diffing algorithm: compare the newly extracted nodes against the existing nodes in the graph to generate the `StructuralGraphDiff` (Added/Removed).

## Phase 4: Building `memory-manager`
1. Implement atomic file writes (write to `.tmp` then rename).
2. Implement file locking mechanism using the `fs` module to prevent concurrent executions.
3. Implement the graph application logic (applying `StructuralGraphDiff` to `graph.json`).
4. Implement the history append logic (`history.jsonl`).

## Phase 5: Building `semantic-engine`
1. Create a generic LLM client interface (allowing swapping between OpenAI, Anthropic, or local Ollama).
2. Implement the prompt construction using the templates in `PROMPT_SPEC.md`.
3. Force JSON output via API parameters or strict system prompts.
4. Validate the LLM output against the `SemanticDiff` Zod schema. Implement the single-retry fallback logic.

## Phase 6: Orchestration and CLI
1. Wire all modules together in `src/orchestrator.ts`.
2. Implement `context-generator` to read the state and format `context.md`.
3. Expose commands via `projectmind-cli`:
   * `projectmind init`: Force full rebuild.
   * `projectmind update`: Run incremental update.

---

### Definition of Done Checklist
- [x] Functional Done: Breaks the blueprint down into 6 actionable phases.
- [x] Architectural Done: Aligns specific implementation tasks with the predefined architectural schemas.
- [x] AI-Ready Done: Provides step-by-step instructions that an AI agent can execute independently.
