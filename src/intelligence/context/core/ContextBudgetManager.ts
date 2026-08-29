import { ContextBudget } from '../models/ContextBudget';
import { ContextItem } from '../models/ContextItem';

export interface BudgetApplicationResult {
  acceptedItems: ContextItem[];
  truncatedItems: ContextItem[];
  budget: ContextBudget;
  totalTokensUsed: number;
}

export class ContextBudgetManager {
  /**
   * Calculates token budget from model context window and reservations
   */
  public calculateBudget(
    modelContextWindow: number = 8192,
    outputReservation: number = 2048,
    systemReservation: number = 1000,
    taskReservation: number = 500,
    safetyMargin: number = 200
  ): ContextBudget {
    const totalReservations = outputReservation + systemReservation + taskReservation + safetyMargin;
    const availableContextBudget = Math.max(500, modelContextWindow - totalReservations);

    return {
      modelContextWindow,
      systemPromptReservation: systemReservation,
      taskPromptReservation: taskReservation,
      outputReservation,
      safetyMargin,
      availableContextBudget
    };
  }

  /**
   * Applies budget constraints to ranked context items.
   * Preserves highest priority (Priority 1) items, truncating lower priority items first.
   */
  public applyBudget(items: ContextItem[], budget: ContextBudget): BudgetApplicationResult {
    let currentTokens = 0;
    const acceptedItems: ContextItem[] = [];
    const truncatedItems: ContextItem[] = [];

    // Sort items by priority ascending (1 = highest), then by relevance descending
    const sorted = [...items].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.relevance - a.relevance;
    });

    for (const item of sorted) {
      const itemTokens = item.tokenEstimate || 50;

      if (currentTokens + itemTokens <= budget.availableContextBudget) {
        acceptedItems.push(item);
        currentTokens += itemTokens;
      } else {
        truncatedItems.push(item);
      }
    }

    const totalTokensUsed = currentTokens;
    budget.estimatedTotalTokens = totalTokensUsed;

    return {
      acceptedItems,
      truncatedItems,
      budget,
      totalTokensUsed
    };
  }
}
