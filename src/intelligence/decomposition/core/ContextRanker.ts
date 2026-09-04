import { ContextCandidate } from '../models/ContextCandidate';
import { RelevanceScorer } from '../ranking/RelevanceScorer';

export class ContextRanker {
  private relevanceScorer = new RelevanceScorer();

  public rankCandidates(
    candidates: ContextCandidate[],
    targetKeywords: string[],
    targetSymbols: string[],
    graphRelations: Map<string, string[]> = new Map()
  ): ContextCandidate[] {
    for (const cand of candidates) {
      cand.relevance = this.relevanceScorer.scoreCandidate(cand, targetKeywords, targetSymbols, graphRelations);
    }

    // Sort descending by overall score
    return [...candidates].sort((a, b) => b.relevance.overallScore - a.relevance.overallScore);
  }
}
