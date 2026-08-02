# Coding Standards and Conventions

This document outlines the strict coding conventions required for any AI or human contributing to the ProjectMind codebase.

## 1. General Principles

* **No Implicit Types:** TypeScript `any` is strictly prohibited unless interacting with an un-typed third-party library. Use `unknown` and type guards instead.
* **Pure Functions:** The `extractor` and `semantic-engine` must be composed of pure functions. State mutation is only allowed within the `memory-manager`.
* **Error Bubbling:** Do not silently swallow errors. Catch them, attach context, and throw them up to the `orchestrator` so the failure lifecycle (defined in `LIFECYCLE.md`) can trigger.

## 2. File and Directory Naming

* Use `kebab-case` for all files and directories (e.g., `semantic-engine.ts`, `prompt-builder.ts`).
* Test files must be named `[module].test.ts`.

## 3. Zod First

Every external boundary must be validated using Zod schemas.
1. The `DiffManifest` from the `git-watcher` must be parsed through a Zod schema.
2. The JSON response from the LLM must be parsed through a Zod schema.
3. Reading `graph.json` from disk must parse through a Zod schema to prevent corruption panics.

## 4. Documentation Standards

* Every exported function or class must have a JSDoc comment explaining its purpose, parameters, and return types.
* If an architectural decision diverges from this specification repository, the `ARCHITECTURE.md` must be updated *before* the code is merged. The documentation is the source of truth, not the code.

## 5. Performance Constraints

* Do not read entire files into memory if they are large (e.g., streaming `history.jsonl`).
* The parsing phase (`tree-sitter`) must complete in under 5 seconds for diffs smaller than 100 files. Optimize loops and avoid unnecessary deep copies of the AST tree.

---

### Definition of Done Checklist
- [x] Functional Done: Defines coding conventions, typing rules, and performance constraints.
- [x] Architectural Done: Enforces the use of Zod for boundary validation between modules.
- [x] AI-Ready Done: Provides explicit formatting and error-handling rules for the implementation agent.
