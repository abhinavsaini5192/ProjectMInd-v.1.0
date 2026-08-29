# Refactor Detection

The `RefactorDetector` infers major structural refactoring operations even when the underlying AST is not directly parsed by this engine. By tracking the exact lifecycle events of symbols (creation, deletion, modification), it can detect:

- **Rename/Move**: One symbol drops, another similar symbol appears.
- **Extract Method**: One symbol is modified, shedding complexity, while a new sibling symbol appears.
- **Inline Method**: A symbol is removed and its parent is modified.
