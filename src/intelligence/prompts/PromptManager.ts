export class PromptManager {
  /**
   * Versioned prompt for classifying changes.
   */
  public static getChangeClassificationPrompt(factsJson: string): string {
    return `
Analyze the following structural facts and determine the primary intent of these changes.
You must output strictly as JSON adhering to the SemanticEvent schema.

Facts:
${factsJson}

Rules:
1. Do NOT invent facts.
2. If uncertain, mark confidence as 'Low' or 'Unknown'.
3. Output nothing but valid JSON.
`;
  }

  /**
   * Versioned prompt for architectural evolution.
   */
  public static getArchitecturalEvolutionPrompt(factsJson: string, previousArchitecture: string): string {
    return `
Analyze the following structural facts against the previous architecture state.
Identify any Layer Violations, Dependency Inversions, or Public API changes.
Output strictly as JSON adhering to the ArchitecturalEvent schema.

Previous Architecture:
${previousArchitecture}

New Facts:
${factsJson}
`;
  }
  
  /**
   * Prompt for summarizing a knowledge graph section.
   */
  public static getSummaryPrompt(graphSlice: string): string {
    return `
Summarize the following repository state in 3 bullet points or less.
State:
${graphSlice}
`;
  }
}
