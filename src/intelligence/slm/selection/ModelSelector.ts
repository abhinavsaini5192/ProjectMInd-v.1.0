import { ModelRegistry } from '../registry/ModelRegistry';
import { ModelRequirements } from '../models/ModelRequirements';
import { ModelSelectionResult } from '../models/ModelSelectionResult';
import { CapabilityMatcher } from './CapabilityMatcher';
import { ModelRankingStrategy } from './ModelRankingStrategy';
import { NoCompatibleModelError } from './NoCompatibleModelError';

export class ModelSelector {
  private matcher = new CapabilityMatcher();
  private rankingStrategy = new ModelRankingStrategy();

  constructor(private registry: ModelRegistry) {}

  public selectModel(requirements: ModelRequirements): ModelSelectionResult {
    const availableModels = this.registry.findAvailableModels();
    
    // 1. Filter hard requirements
    const matchResult = this.matcher.evaluateHardRequirements(availableModels, requirements);
    
    if (matchResult.matched.length === 0) {
      throw new NoCompatibleModelError(requirements, matchResult.rejected);
    }

    // 2. Rank candidates
    const ranked = this.rankingStrategy.rankModels(matchResult.matched, requirements);

    // 3. Select best candidate
    const bestMatch = ranked[0];
    
    return {
      selectedModel: bestMatch.model,
      selectedProviderId: bestMatch.model.providerId,
      score: bestMatch.score,
      matchedRequirements: Object.keys(requirements),
      rejectedModels: matchResult.rejected,
      selectionReason: `Highest-ranked available model (${bestMatch.score.totalScore} pts) satisfying requirements.`
    };
  }
}
