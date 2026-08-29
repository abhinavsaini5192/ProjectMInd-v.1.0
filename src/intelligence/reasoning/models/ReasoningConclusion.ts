export interface ReasoningConclusion {
  statement: string;
  evidenceIds: string[];
  confidence: number;
  assumptions?: string[];
  uncertainty?: string;
}
