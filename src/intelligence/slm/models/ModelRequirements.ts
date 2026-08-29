export interface ModelRequirements {
  taskType?: string;
  minimumContextWindow?: number;
  minimumOutputTokens?: number;
  requiresStructuredOutput?: boolean;
  requiresToolCalling?: boolean;
  requiresStreaming?: boolean;
  requiresEmbeddings?: boolean;
  requiresVision?: boolean;
  requiresSystemPrompt?: boolean;
  preferredLocal?: boolean;
  preferredModelId?: string;
  strictModelSelection?: boolean;
  minimumReliability?: number;
}
