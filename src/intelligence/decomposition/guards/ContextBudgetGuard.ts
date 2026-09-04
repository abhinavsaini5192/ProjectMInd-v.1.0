import { ContextBudget } from '../models/ContextBudget';
import { ContextCandidate } from '../models/ContextCandidate';
import { ContextBudgetExceededError } from '../errors/ContextBudgetExceededError';

export class ContextBudgetGuard {
  public enforceBudget(candidates: ContextCandidate[], budget: ContextBudget): {
    selected: ContextCandidate[];
    excluded: Array<{ resourceId: string; reason: string }>;
    usedTokens: number;
  } {
    const selected: ContextCandidate[] = [];
    const excluded: Array<{ resourceId: string; reason: string }> = [];

    // Sort by overall score descending
    const sorted = [...candidates].sort((a, b) => b.relevance.overallScore - a.relevance.overallScore);

    let currentTokens = budget.reservedTokens;
    const availableTokens = budget.maxTokens - budget.reservedTokens;

    for (const cand of sorted) {
      if (currentTokens + cand.tokenCost <= budget.maxTokens) {
        selected.push(cand);
        currentTokens += cand.tokenCost;
      } else {
        excluded.push({
          resourceId: cand.resourceId,
          reason: `Exceeds context token budget limit (cost: ${cand.tokenCost}, remaining: ${budget.maxTokens - currentTokens})`
        });
      }
    }

    return {
      selected,
      excluded,
      usedTokens: currentTokens
    };
  }
}
