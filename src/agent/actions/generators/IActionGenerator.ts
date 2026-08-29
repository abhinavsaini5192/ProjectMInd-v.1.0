import { PlanStep } from '../../planning/models/PlanStep';
import { AgentAction } from '../models/AgentAction';

export interface IActionGenerator {
  generate(step: PlanStep, taskId: string, planId: string): AgentAction[];
}
