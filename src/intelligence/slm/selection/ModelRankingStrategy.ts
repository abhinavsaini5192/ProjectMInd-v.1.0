import { ModelRecord } from '../registry/ModelRecord';
import { ModelRequirements } from '../models/ModelRequirements';
import { ModelScore } from '../models/ModelSelectionResult';

export class ModelRankingStrategy {
  public rankModels(candidates: ModelRecord[], requirements: ModelRequirements): Array<{ model: ModelRecord, score: ModelScore }> {
    return candidates.map(model => {
      const score = this.calculateScore(model, requirements);
      return { model, score };
    }).sort((a, b) => b.score.totalScore - a.score.totalScore);
  }

  private calculateScore(model: ModelRecord, requirements: ModelRequirements): ModelScore {
    let capabilityScore = 0;
    let contextScore = 0;
    let localityScore = 0;
    let preferenceScore = 0;
    const performanceScore = 10; // Default placeholder for future latency metrics
    const reliabilityScore = 10; // Default placeholder

    // Capability score
    if (model.capabilities.supportsStructuredOutput) capabilityScore += 5;
    if (model.capabilities.supportsToolCalling) capabilityScore += 5;

    // Context score (reward larger context windows)
    if (model.contextWindow >= 32000) contextScore += 10;
    else if (model.contextWindow >= 16000) contextScore += 5;
    else if (model.contextWindow >= 8000) contextScore += 2;

    // Locality preference
    const isLocal = model.providerType === 'local' || model.providerType === 'ollama';
    if (requirements.preferredLocal && isLocal) localityScore += 20;

    // Direct preference
    if (requirements.preferredModelId && (model.modelId === requirements.preferredModelId || model.modelName === requirements.preferredModelId)) {
       preferenceScore += 50; // High weight for preferred model
    }

    const totalScore = capabilityScore + contextScore + performanceScore + reliabilityScore + localityScore + preferenceScore;

    return {
      capabilityScore,
      contextScore,
      performanceScore,
      reliabilityScore,
      localityScore,
      preferenceScore,
      totalScore
    };
  }
}
