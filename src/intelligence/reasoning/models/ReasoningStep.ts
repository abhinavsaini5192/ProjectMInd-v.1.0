export type ReasoningStatementType =
  | 'OBSERVATION'
  | 'EVIDENCE'
  | 'INFERENCE'
  | 'HYPOTHESIS'
  | 'CONCLUSION'
  | 'RECOMMENDATION';

export interface ReasoningStep {
  stepNumber: number;
  type: ReasoningStatementType;
  statement: string;
  evidenceIds?: string[];
  confidence?: number;
}
