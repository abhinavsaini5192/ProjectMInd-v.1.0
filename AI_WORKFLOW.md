# AI Workflow Specification

This document defines how primary autonomous AI coding agents (the consumers) interact with ProjectMind.

## 1. The Interaction Paradigm

ProjectMind relies on a read-heavy, write-light paradigm for the AI agent. The AI agent **never** writes to the `.projectmind` directory directly. 

* **Agent Role:** Read Context -> Write Source Code -> Commit.
* **ProjectMind Role:** Observe Commit -> Generate Context -> Sleep.

## 2. Reading Context (The Onboarding Phase)

When an AI Agent starts a new session (or is given a new major prompt by the user), it must ingest the project context.

1. **Check for ProjectMind:** The agent checks if `.projectmind/context.md` exists.
2. **Ingest Manifest:** If it exists, the agent loads the contents of `context.md` into its primary context window immediately.
3. **Query Graph (Optional):** If the agent needs highly specific dependency chains (e.g., "Find all functions that call `Auth.login`"), it can read `graph.json` or use a provided ProjectMind CLI tool to query the graph locally.

## 3. Triggering Updates

ProjectMind must be updated after the AI Agent completes a block of work. There are three supported integration methods:

### 3.1 The Git Hook Method (Recommended)
ProjectMind installs a `post-commit` hook. Whenever the AI Agent (or human) commits changes to Git, the hook automatically runs `projectmind update`. The AI agent does not need to know ProjectMind exists beyond reading the context file.

### 3.2 The CLI Trigger Method
If the AI Agent is scriptable (like an autonomous SWE-agent loop), it can explicitly invoke `projectmind update` after it finishes mutating files, but before it starts its next planning phase. This is useful for capturing mid-commit state.

### 3.3 The LSP Server Method (Future Scope)
ProjectMind runs as a background Language Server Protocol (LSP) daemon, observing file save events and updating its internal memory graph in real-time.

## 4. Resolving Ambiguity

If an AI Agent is unsure of an architectural decision, it should **not** guess. It should consult the `context.md` "Recent Decisions" section. If the answer is not there, it should ask the human user. ProjectMind tracks decisions made by humans and propagates them to future agent sessions, serving as a permanent memory of resolved ambiguities.

---

### Definition of Done Checklist
- [x] Functional Done: Defines how external AI agents read from and interact with ProjectMind.
- [x] Architectural Done: Reinforces the read-only boundary for external agents against `.projectmind`.
- [x] AI-Ready Done: Details the exact steps an agent takes to onboard to a project using ProjectMind.
