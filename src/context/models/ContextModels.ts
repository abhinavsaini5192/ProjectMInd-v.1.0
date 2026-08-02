export enum ContextLevel {
  LEVEL_0_OVERVIEW = 0,
  LEVEL_1_SUBSYSTEM = 1,
  LEVEL_2_MODULE = 2,
  LEVEL_3_FILE = 3,
  LEVEL_4_SYMBOL = 4,
  LEVEL_5_AST_FRAGMENT = 5
}

export interface SelectedFile {
  path: string;
  justification: string;
}

/**
 * Standardized Context Package sent to the AI.
 */
export interface ContextPackage {
  /** The routing intent that triggered this retrieval */
  taskIntent: string;
  
  /** Short summary of current repository state */
  projectState: string;
  
  /** Selected files and why they were selected */
  relevantFiles: SelectedFile[];
  
  /** Relevant graph nodes (classes, functions, etc.) */
  relevantSymbols: string[];
  
  /** Formatted string ready to inject into the prompt */
  compiledPromptText?: string;
  
  /** Token estimation of the final package */
  estimatedTokens: number;
}
