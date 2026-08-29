import { ContextItem } from '../models/ContextItem';

export class ContextBudgetOptimizer {
  public optimize(rankedItems: ContextItem[], maxTokens: number): ContextItem[] {
    const optimized: ContextItem[] = [];
    let currentTokens = 0;

    for (const item of rankedItems) {
      if (item.category === 'EXCLUDED') continue;

      if (item.category === 'REQUIRED') {
         // Always include required context, even if it blows the budget (or throw an error)
         optimized.push(item);
         currentTokens += item.estimatedTokenCost;
      } else {
         if (currentTokens + item.estimatedTokenCost <= maxTokens) {
            optimized.push(item);
            currentTokens += item.estimatedTokenCost;
         }
      }
    }

    return optimized;
  }
}
