export interface ClarificationRequest {
  id: string;
  question: string;
  options?: string[]; // If it's a multiple choice
  expectedInformationGain: number; // Value metric
  userEffort: number; // Cost metric
  valueScore: number; // Gain / Effort
}
