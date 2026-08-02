# Product Vision

## The "Why" of ProjectMind

For over three decades, developers have relied on tools like **Git** to track changes to their source code. Git tells us *what* changed, *who* changed it, and *when* it was changed. 

However, we are now entering the era of AI-driven software engineering. AI agents do not just need to know what changed—they need to know *why* it changed, *how* the system is architected, and *what* the current state of the project's evolution is. 

Currently, when an AI agent is introduced to a repository, it behaves like an amnesiac engineer starting their first day on the job. It has to read thousands of lines of code to infer the architecture, the domain models, and the design patterns. If the agent's context window is cleared, it forgets everything. 

**ProjectMind exists to solve AI amnesia.** 

It is a persistent, structural, and semantic memory engine. Just as **Docker** decoupled the application from the operating system, and **Kubernetes** decoupled the deployment from the infrastructure, **ProjectMind** decouples *project understanding* from *source code parsing*. 

## The Evolution of Context

1. **Generation 1: Stateless AI (ChatGPT).** You paste snippets of code. It replies. It forgets everything.
2. **Generation 2: Brute-Force Context (Cursor, GitHub Copilot).** The tool reads your entire workspace or highly-ranked search results and stuffs them into a massive context window. It is expensive, slow, and prone to losing details in the noise.
3. **Generation 3: ProjectMind.** The AI reads a highly condensed, pre-computed summary of the project architecture, recent decisions, and task states from the `.projectmind` directory. It requires a fraction of the tokens and provides perfect architectural clarity.

## Core Tenets

### 1. Agents Are Consumers, Not Maintainers
An AI coding agent's job is to write code and solve problems. It should not be burdened with the task of remembering what happened three days ago. ProjectMind takes on the burden of memory. The agent writes the code; ProjectMind records the state.

### 2. Determinism Provides the Foundation; AI Provides the Nuance
We do not use LLMs to figure out if `Class A` inherits from `Class B`. We use deterministic AST parsers for that. We *do* use LLMs to summarize *why* a developer introduced the Factory Pattern in a specific module. ProjectMind merges absolute structural truth with semantic summaries.

### 3. The Power of Incrementalism
A repository with 1,000 files only changes a few files per commit. ProjectMind never rescans the entire repository after the initial ingestion. It watches the Git diff, processes only the changed files, and updates the structural graph and semantic summaries incrementally.

## The Long-Term Vision

Ultimately, ProjectMind will become the standard protocol for AI-to-Codebase interaction. 
A `.projectmind` folder will become as ubiquitous in software projects as a `.git` folder. 

When a human developer hires an autonomous AI agent to fix a bug, the agent will not clone the repo and start reading source files. It will clone the repo, read the `.projectmind` index, instantly understand the architecture, submit the fix, and allow ProjectMind to record the action for the next agent.

---

### Definition of Done Checklist
- [x] Functional Done: Articulates the core vision, "why" it exists, and the evolution of context.
- [x] Architectural Done: Clarifies the separation of concerns (Agent = write code, ProjectMind = remember state) and compares to Git/Docker.
- [x] AI-Ready Done: Establishes strong design tenets that inform future implementation decisions. No ambiguity.
