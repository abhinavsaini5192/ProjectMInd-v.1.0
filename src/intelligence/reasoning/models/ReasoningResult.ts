import { ReasoningStep } from './ReasoningStep';
import { ReasoningEvidence } from './ReasoningEvidence';
import { ReasoningConclusion } from './ReasoningConclusion';
import { ReasoningUncertainty } from './ReasoningUncertainty';
import { ReasoningDecision } from './ReasoningDecision';
import { ReasoningPlan } from './ReasoningPlan';

export type ReasoningValidationStatus = 'VALID' | 'PARTIALLY_VALID' | 'INVALID';

export interface ReasoningResult {
  reasoningId: string;
  taskId: string;
  modelId: string;
  contextPackageId: string;
  promptVersion: string;
  observations: ReasoningStep[];
  evidence: ReasoningEvidence[];
  hypotheses: ReasoningStep[];
  conclusions: ReasoningConclusion[];
  assumptions: string[];
  alternatives: string[];
  uncertainty: ReasoningUncertainty[];
  recommendations: string[];
  decision: ReasoningDecision;
  plan?: ReasoningPlan;
  confidence: number;
  validationStatus: ReasoningValidationStatus;
  validationIssues?: string[];
  schemaVersion: string;
  strategyVersion: string;
  createdAt: number;
}
