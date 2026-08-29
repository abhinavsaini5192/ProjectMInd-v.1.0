import { Decision } from '../models/Decision';
import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { ActionPlan } from '../models/ActionPlan';

export interface PlanningStrategy {
  readonly name: string;
  readonly version: string;
  supports(decision: Decision): boolean;
  buildPlan(decision: Decision, reasoning: ReasoningResult, knowledgeVersion?: string): ActionPlan;
}
