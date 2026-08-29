import { PlanningError } from './PlanningError';

export class MissingPreconditionError extends PlanningError {
  constructor(public precondition: string, public target: string) {
    super(`MissingPreconditionError: Precondition "${precondition}" not satisfied for target "${target}"`, {
      precondition,
      target
    });
    this.name = 'MissingPreconditionError';
  }
}
