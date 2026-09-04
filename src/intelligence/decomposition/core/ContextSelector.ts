import { ContextCandidate } from '../models/ContextCandidate';
import { ContextBudget } from '../models/ContextBudget';
import { ContextSelection } from '../models/ContextSelection';
import { InformationGap } from '../models/InformationGap';
import { ContextBudgetGuard } from '../guards/ContextBudgetGuard';
import { ContextRanker } from './ContextRanker';

export class ContextSelector {
  private ranker = new ContextRanker();
  private budgetGuard = new ContextBudgetGuard();

  public selectContext(
    subtaskId: string,
    candidates: ContextCandidate[],
    budget: ContextBudget,
    targetKeywords: string[],
    targetSymbols: string[],
    gaps: InformationGap[] = []
  ): ContextSelection {
    const ranked = this.ranker.rankCandidates(candidates, targetKeywords, targetSymbols);
    const { selected, excluded, usedTokens } = this.budgetGuard.enforceBudget(ranked, budget);

    const averageConfidence = selected.length > 0
      ? selected.reduce((sum, c) => sum + c.confidence, 0) / selected.length
      : 0.8;

    return {
      selectionId: `sel_${subtaskId}_${Date.now()}`,
      subtaskId,
      selectedCandidates: selected,
      excludedCandidates: excluded,
      selectionReason: `Selected ${selected.length} high-relevance items within ${budget.maxTokens} token budget`,
      totalTokens: usedTokens,
      confidence: averageConfidence,
      informationGaps: gaps,
      createdAt: Date.now()
    };
  }
}
