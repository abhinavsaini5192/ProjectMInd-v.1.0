export interface ContextPackage {
  task: string;
  
  primaryContext: string[]; // Highly relevant files
  secondaryContext: string[]; // Useful but not critical
  
  architecture: string[]; // Layer boundaries, rules
  dependencies: string[]; // Critical call chains
  
  recentChanges: string[]; // Historical evolution context
  knownProblems: string[]; 
  decisions: string[]; // Historical decisions related to this task
  
  confidence: number;
}

export interface ContextBudget {
  maxEntities: number;
  maxFiles: number;
  maxTokens: number;
}
