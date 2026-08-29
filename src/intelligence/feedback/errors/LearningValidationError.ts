import { FeedbackError } from './FeedbackError';

export class LearningValidationError extends FeedbackError {
  constructor(message: string, public issues: string[]) {
    super(`LearningValidationError: ${message} -> [${issues.join('; ')}]`, { issues });
    this.name = 'LearningValidationError';
  }
}
