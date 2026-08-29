export class ContextPlanningError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`ContextPlanningError: ${message}`);
    this.name = 'ContextPlanningError';
  }
}
