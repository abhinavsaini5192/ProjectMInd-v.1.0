import { ContextItem } from '../models/ContextItem';
import { ContextPlan } from '../models/ContextPlan';
import { ContextScorer } from './ContextScorer';

export class RelevanceRanker {
  private scorer = new ContextScorer();

  public rank(items: ContextItem[], plan: ContextPlan): ContextItem[] {
    const scoredItems = items.map(item => {
      const breakdown = this.scorer.calculateScore(item, plan);
      return {
        item: {
          ...item,
          relevance: breakdown.finalScore,
          metadata: {
            ...item.metadata,
            scoreBreakdown: breakdown
          }
        },
        score: breakdown.finalScore
      };
    });

    // Sort descending by finalScore, then ascending by priority number (1 is higher priority than 2)
    scoredItems.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.item.priority - b.item.priority;
    });

    return scoredItems.map(si => si.item);
  }
}
