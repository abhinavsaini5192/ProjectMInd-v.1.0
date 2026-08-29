import { PlanningError } from './PlanningError';

export class InvalidPlanError extends PlanningError {
  constructor(message: string, public issues: string[]) {
    super(`InvalidPlanError: ${message} -> [${issues.join('; ')}]`, { issues });
    this.name = 'InvalidPlanError';
  }
}
