import { ContextBudgetManager } from './ContextBudgetManager';
import { ContextRanker } from './ContextRanker';

export class ContextAssemblyEngine {
  private budgetManager = new ContextBudgetManager();
  private ranker = new ContextRanker();

  public assemble(rawNodes: any[]): any {
    const ranked = this.ranker.rank(rawNodes);
    const budgetAware = this.budgetManager.truncate(ranked);

    return {
      nodes: budgetAware,
      truncatedCount: rawNodes.length - budgetAware.length,
      assembledAt: Date.now()
    };
  }
}
