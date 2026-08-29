export interface SuccessAnalysis {
  succeededSteps: string[];
  whySucceeded: string;
  verificationsPassed: string[];
  unexpectedChanges: string[];
  confidence: number;
}
