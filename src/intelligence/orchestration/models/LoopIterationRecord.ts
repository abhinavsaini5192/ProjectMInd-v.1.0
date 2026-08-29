import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { Decision } from '../../planning/models/Decision';
import { ActionPlan } from '../../planning/models/ActionPlan';

export interface LoopIterationRecord {
  iterationNumber: number;
  startedAt: number;
  completedAt: number;
  reasoning?: ReasoningResult;
  decision?: Decision;
  plan?: ActionPlan;
  executionStatus?: string;
  verificationPassed?: boolean;
  recoveryTriggered?: boolean;
  errors?: string[];
}
