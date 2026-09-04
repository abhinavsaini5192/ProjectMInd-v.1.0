import { ContextCandidate } from '../models/ContextCandidate';
import { RelevanceScorer } from '../ranking/RelevanceScorer';

export class KnowledgeAdapter {
  private relevanceScorer = new RelevanceScorer();

  public async queryKnowledge(targetSymbol: string, keywords: string[]): Promise<ContextCandidate[]> {
    // Adapter querying knowledge layer or returning structured candidate
    return [
      {
        candidateId: `cand_${targetSymbol}`,
        resourceId: targetSymbol,
        resourceType: 'SYMBOL',
        source: 'CODE_AST',
        content: `export class ${targetSymbol} { execute() { /* ... */ } }`,
        summary: `Definition and exported methods of ${targetSymbol}`,
        relevance: this.relevanceScorer.scoreCandidate(
          { resourceId: targetSymbol, source: 'CODE_AST', dependencyDistance: 0 },
          keywords,
          [targetSymbol]
        ),
        confidence: 0.95,
        dependencyDistance: 0,
        tokenCost: 150
      }
    ];
  }
}
