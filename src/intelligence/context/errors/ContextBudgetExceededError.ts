export class ContextBudgetExceededError extends Error {
  constructor(message: string, public requestedTokens: number, public budgetTokens: number) {
    super(`ContextBudgetExceededError: ${message} (Requested: ${requestedTokens}, Budget: ${budgetTokens})`);
    this.name = 'ContextBudgetExceededError';
  }
}
