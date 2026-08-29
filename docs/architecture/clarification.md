# Clarification Engine

When the system detects a `KnowledgeGap` that prevents it from reaching a safe decision threshold, it halts autonomous execution and generates a `ClarificationRequest`.

The `ClarificationEngine` ranks missing gaps using the formula:
`ValueScore = ExpectedInformationGain / UserEffort`

This ensures that ProjectMind asks the most impactful, easiest-to-answer question possible, rather than bombarding the user with vague prompts like "Can you explain more?".
