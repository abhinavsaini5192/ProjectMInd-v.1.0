import { ModelRecord } from '../registry/ModelRecord';
import { ModelRequirements } from '../models/ModelRequirements';
import { RejectedModel } from '../models/ModelSelectionResult';

export class CapabilityMatcher {
  public evaluateHardRequirements(models: ModelRecord[], requirements: ModelRequirements): {
    matched: ModelRecord[],
    rejected: RejectedModel[]
  } {
    const matched: ModelRecord[] = [];
    const rejected: RejectedModel[] = [];

    for (const model of models) {
      let failedReason: string | null = null;

      if (requirements.strictModelSelection && requirements.preferredModelId) {
        if (model.modelId !== requirements.preferredModelId && model.modelName !== requirements.preferredModelId) {
           failedReason = `Strict selection enabled: Model does not match preferred ID (${requirements.preferredModelId})`;
        }
      }

      if (!failedReason && requirements.minimumContextWindow) {
        if (model.contextWindow < requirements.minimumContextWindow) {
          failedReason = `Context window too small (has ${model.contextWindow}, needs ${requirements.minimumContextWindow})`;
        }
      }

      if (!failedReason && requirements.requiresStructuredOutput && !model.capabilities.supportsStructuredOutput) {
        failedReason = 'Structured output is required but unsupported';
      }

      if (!failedReason && requirements.requiresToolCalling && !model.capabilities.supportsToolCalling) {
        failedReason = 'Tool calling is required but unsupported';
      }

      if (!failedReason && requirements.requiresStreaming && !model.capabilities.supportsStreaming) {
        failedReason = 'Streaming is required but unsupported';
      }

      if (!failedReason && requirements.requiresEmbeddings && !model.capabilities.supportsEmbeddings) {
        failedReason = 'Embeddings are required but unsupported';
      }

      if (!failedReason && requirements.requiresVision && !model.capabilities.supportsVision) {
        failedReason = 'Vision is required but unsupported';
      }

      if (failedReason) {
        rejected.push({ modelId: model.modelId, reason: failedReason });
      } else {
        matched.push(model);
      }
    }

    return { matched, rejected };
  }
}
