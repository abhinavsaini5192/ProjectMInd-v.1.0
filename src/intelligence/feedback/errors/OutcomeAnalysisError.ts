import { FeedbackError } from './FeedbackError';

export class OutcomeAnalysisError extends FeedbackError {
  constructor(message: string, public outcomeDetails?: Record<string, any>) {
    super(`OutcomeAnalysisError: ${message}`, outcomeDetails);
    this.name = 'OutcomeAnalysisError';
  }
}
