import { PlanningError } from './PlanningError';

export class PlanningConflictError extends PlanningError {
  constructor(message: string, public conflicts: string[]) {
    super(`PlanningConflictError: ${message} -> [${conflicts.join('; ')}]`, { conflicts });
    this.name = 'PlanningConflictError';
  }
}
