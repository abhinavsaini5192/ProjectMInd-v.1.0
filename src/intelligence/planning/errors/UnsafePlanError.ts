import { PlanningError } from './PlanningError';

export class UnsafePlanError extends PlanningError {
  constructor(message: string, public riskReasons: string[]) {
    super(`UnsafePlanError: ${message} -> [${riskReasons.join('; ')}]`, { riskReasons });
    this.name = 'UnsafePlanError';
  }
}
