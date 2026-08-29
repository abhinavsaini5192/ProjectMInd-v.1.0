# Patch System

The Modification Engine uses a multi-stage patching pipeline:

1. **`ChangeSet`**: A structured object containing the raw modified code, the original file hash (`beforeHash`), the resulting file hash (`afterHash`), and an impact score.
2. **`PatchGenerator`**: Translates the `before` and `after` states into a standard unified diff format.
3. **`PatchValidator`**: A critical guardrail that runs *before* the patch is written to disk. It checks for obvious syntax corruption (e.g., unmatched brackets) and hooks into the `ILanguageAdapter` for deep AST validation.
4. **`PatchPreview`**: Formats the diff cleanly for CLI or GUI output so human approvers can read exactly what the AI intends to change.
