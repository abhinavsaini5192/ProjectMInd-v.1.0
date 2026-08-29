# Code Transformation

ProjectMind enforces a **Minimal Change Principle**. The agent does not rewrite entire files unnecessarily. 

## Strategy
If the target is a specific symbol (e.g., `AuthService.login`), the AST subsystem (via `ILanguageAdapter`) identifies the exact line ranges. The `ChangeGenerator` then splices the modification directly into that block, leaving the rest of the file untouched. 

This drastically reduces the blast radius of AI hallucination and limits unexpected side effects during concurrent user development.
