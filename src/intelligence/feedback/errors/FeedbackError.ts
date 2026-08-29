export class FeedbackError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`FeedbackError: ${message}`);
    this.name = 'FeedbackError';
  }
}
