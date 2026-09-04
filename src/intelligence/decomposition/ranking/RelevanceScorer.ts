import { ContextCandidate } from '../models/ContextCandidate';
import { ContextRelevance } from '../models/ContextRelevance';
import { StructuralRelevance } from './StructuralRelevance';
import { DependencyRelevance } from './DependencyRelevance';
import { RecencyScorer } from './RecencyScorer';
import { SemanticRelevance } from './SemanticRelevance';
import { ConfidenceScorer } from './ConfidenceScorer';

export class RelevanceScorer {
  private structuralScorer = new StructuralRelevance();
  private dependencyScorer = new DependencyRelevance();
  private recencyScorer = new RecencyScorer();
  private semanticScorer = new SemanticRelevance();
  private confidenceScorer = new ConfidenceScorer();

  public scoreCandidate(
    candidate: Partial<ContextCandidate>,
    targetKeywords: string[],
    targetSymbols: string[],
    graphRelations: Map<string, string[]> = new Map()
  ): ContextRelevance {
    const structural = this.structuralScorer.calculate(candidate.resourceId || '', targetSymbols, graphRelations);
    const dependency = this.dependencyScorer.calculate(candidate.dependencyDistance ?? 5);
    const recency = this.recencyScorer.calculate(candidate.recencyTimestamp);
    const semantic = this.semanticScorer.calculate(candidate.content || candidate.summary || '', targetKeywords);
    const confidence = this.confidenceScorer.calculate(candidate.source || 'UNKNOWN', candidate.confidence ?? 0.8);

    // Weighted composite score
    const taskRelevance = (structural * 0.35) + (dependency * 0.25) + (semantic * 0.25) + (recency * 0.1) + (confidence * 0.05);

    const whyIncluded = structural >= 0.85
      ? `Direct structural match with target [${candidate.resourceId}]`
      : dependency >= 0.7
      ? `Close dependency distance (${candidate.dependencyDistance}) to execution target`
      : semantic >= 0.6
      ? `High semantic keyword overlap with subtask objectives`
      : `Supporting context for ${candidate.resourceId}`;

    return {
      overallScore: Math.min(1.0, Math.max(0.0, taskRelevance)),
      taskRelevance,
      structuralRelevance: structural,
      dependencyRelevance: dependency,
      semanticRelevance: semantic,
      recencyRelevance: recency,
      confidenceScore: confidence,
      whyIncluded
    };
  }
}
