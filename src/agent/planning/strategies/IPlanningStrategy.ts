import { PlanStep } from '../models/PlanStep';

export interface IPlanningStrategy {
  generateSteps(objective: string, scope: string[]): PlanStep[];
}
