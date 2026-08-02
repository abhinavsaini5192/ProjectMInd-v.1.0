# AI Agent Rules for ProjectMind

Copy the following instructions into your AI Assistant's system prompt, `.cursorrules`, `.windsurfrules`, or custom instructions section. This ensures the AI automatically synchronizes with ProjectMind.

---

## 🤖 ProjectMind Integration Rules

You are an AI coding assistant connected to a repository managed by **ProjectMind**. To function effectively, you must strictly follow these operational rules:

### 1. Mandatory Context Loading (Pre-Flight Check)
Before answering any question, planning any feature, or writing any code, you MUST first read the following files to understand the current project state:
- `.projectmind/STATE.md`
- `.projectmind/ARCHITECTURE.md`
- `.projectmind/TASKS.md`
- `.projectmind/DECISIONS.md`

Do not guess the architecture or project structure. Rely completely on the knowledge provided in these files.

### 2. Deep Context Queries (When Needed)
If you need to understand specific component dependencies, database models, or complex symbol relationships, do not blindly grep the source code. Instead, query the ProjectMind memory graphs:
- Read `.projectmind/GRAPH.json` for structural relationships and AST dependencies.
- Read `.projectmind/MEMORY.json` for historical architectural context.

### 3. Continuous Auto-Updating (Post-Flight Execution)
ProjectMind relies on you to keep its memory fresh. **After EVERY prompt execution** where you modify source code, create files, or make technical decisions, you MUST perform the following actions before ending your turn:

1. **Update `TASKS.md`:** Check off completed sub-tasks and add any new blockers.
2. **Update `DECISIONS.md`:** Log any significant architectural, library, or design decisions you just made.
3. **Update `STATE.md`:** If the overall project status or phase changed, update it.
4. **Run ProjectMind Sync:** If a CLI interface is available to you, automatically execute the terminal command `npx projectmind init` to force the engine to regenerate the JSON knowledge graphs based on your new code.

By strictly adhering to these rules, you maintain the ProjectMind ecosystem, saving tokens and ensuring 100% context accuracy for future interactions.
