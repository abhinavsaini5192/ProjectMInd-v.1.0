import { ISLMProvider } from './ISLMProvider';
import { SLMRequest } from '../models/SLMRequest';
import { SLMResponse } from '../models/SLMResponse';
import { SLMCapabilities } from '../models/SLMCapabilities';
import { ModelMetadata } from '../models/ModelMetadata';
import { SLMConfig } from '../models/SLMConfig';
import { ModelRecord } from '../registry/ModelRecord';
import { ModelAvailability } from '../registry/ModelAvailability';

export class OpenAICompatibleProvider implements ISLMProvider {
  constructor(private config: SLMConfig) {}

  async generate(request: SLMRequest): Promise<SLMResponse> {
    // Normalization from OpenAI response to SLMResponse
    return {
      requestId: request.requestId,
      model: this.config.model,
      output: 'OpenAI Mock',
      finishReason: 'stop',
      latencyMs: 100
    };
  }

  async healthCheck(): Promise<boolean> { return true; }

  async getCapabilities(): Promise<SLMCapabilities> {
    return {
      contextWindow: this.config.contextWindow,
      supportsStreaming: true,
      supportsStructuredOutput: true,
      supportsToolCalling: true,
      supportsEmbeddings: false,
      supportsVision: false,
      supportsSystemPrompt: true
    };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      provider: 'openai',
      modelName: this.config.model,
      contextWindow: this.config.contextWindow,
      capabilities: await this.getCapabilities()
    };
  }

  async listModels(): Promise<ModelRecord[]> {
    return [{
      modelId: `openai-${this.config.model}`,
      modelName: this.config.model,
      providerId: 'openai',
      providerType: 'openai',
      capabilities: await this.getCapabilities(),
      contextWindow: this.config.contextWindow,
      availability: ModelAvailability.AVAILABLE,
      lastSeen: Date.now()
    }];
  }
}
