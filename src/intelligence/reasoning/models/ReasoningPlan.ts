export interface ReasoningPlanStep {
  stepNumber: number;
  description: string;
  reason: string;
  dependencies: string[];
  expectedOutcome: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ReasoningPlan {
  planId: string;
  title: string;
  steps: ReasoningPlanStep[];
}
