export interface TrainingExample {
  exampleId: string;
  decisionId: string;
  input: {
    task: string;
    repositoryStateSummary: string; // Sanitized representation of L2 graph
  };
  output: {
    recommendedContextIds: string[];
  };
  metadata: {
    decisionScore: number;
    timestamp: number;
  };
}
