export class PlanningError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`PlanningError: ${message}`);
    this.name = 'PlanningError';
  }
}
