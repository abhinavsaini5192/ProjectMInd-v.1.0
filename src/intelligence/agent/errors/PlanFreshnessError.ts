export class PlanFreshnessError extends Error {
  constructor(
    message: string,
    public readonly staleFiles: string[],
    public readonly details?: Record<string, any>
  ) {
    super(`PlanFreshnessError: ${message}`);
    this.name = 'PlanFreshnessError';
  }
}
