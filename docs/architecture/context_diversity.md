# Context Diversity

To prevent the SLM Context Window from being flooded by a single massive file or module, the `ContextDiversityManager` artificially adjusts relevance scores.

If the Context Graph discovers that 80% of the requested tokens belong to `SYMBOL` nodes from a single directory, it will dynamically penalize those symbols and boost `TEST`, `ARCHITECTURE`, and `CONFIGURATION` nodes. This ensures the coding agent receives a balanced, 360-degree view of the required modification area.
