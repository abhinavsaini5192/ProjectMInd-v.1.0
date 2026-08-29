export interface TaskGoal {
  originalGoal: string;
  normalizedGoal: string;
  successCriteria: string[];
  constraints: string[];
  requiredEvidence: string[];
}
