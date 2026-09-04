import { DecompositionError } from './DecompositionError';

export class ContextBudgetExceededError extends DecompositionError {
  constructor(public requestedTokens: number, public budgetLimit: number) {
    super(`Context budget exceeded: requested ${requestedTokens} tokens but limit is ${budgetLimit}`, {
      requestedTokens,
      budgetLimit
    });
    this.name = 'ContextBudgetExceededError';
  }
}
