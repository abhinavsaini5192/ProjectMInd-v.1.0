export interface ContextRelevance {
  overallScore: number; // 0.0 to 1.0
  taskRelevance: number;
  structuralRelevance: number;
  dependencyRelevance: number;
  semanticRelevance: number;
  recencyRelevance: number;
  confidenceScore: number;
  whyIncluded: string;
}
