# Reasoning Strategies

ProjectMind employs domain-specific `ReasoningStrategy` implementations to tailor prompts and post-process results for distinct engineering tasks.

## Supported Strategies
1. **`BugFixReasoning` (`BUG_ANALYSIS`)**:
   - Focuses on observed symptoms, dependency chains, recent changes, competing root-cause hypotheses, and regression risks.
2. **`CodeReviewReasoning` (`CODE_REVIEW`)**:
   - Focuses on diffs, symbol contract boundaries, architectural violations, and security constraints.
3. **`ArchitectureReasoning` (`ARCHITECTURE_ANALYSIS`)**:
   - Focuses on modular boundaries, cross-layer dependency flow, cohesion, and coupling metrics.
4. **`PlanningReasoning` (`IMPLEMENTATION_PLANNING`, `CHANGE_PLANNING`)**:
   - Focuses on phased implementation steps, dependency ordering, risk analysis, and verification requirements.
