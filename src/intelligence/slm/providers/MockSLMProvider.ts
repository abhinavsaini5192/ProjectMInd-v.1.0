import { ISLMProvider } from './ISLMProvider';
import { SLMRequest } from '../models/SLMRequest';
import { SLMResponse } from '../models/SLMResponse';
import { SLMCapabilities } from '../models/SLMCapabilities';
import { ModelMetadata } from '../models/ModelMetadata';
import { SLMResponseError } from '../errors/SLMResponseError';
import { SLMUnavailableError } from '../errors/SLMUnavailableError';
import { ModelRecord } from '../registry/ModelRecord';
import { ModelAvailability } from '../registry/ModelAvailability';

export class MockSLMProvider implements ISLMProvider {
  private overrideResponse: Partial<SLMResponse> | null = null;
  private overrideError: Error | null = null;

  public setOverrideResponse(response: Partial<SLMResponse>) {
    this.overrideResponse = response;
    this.overrideError = null;
  }

  public setOverrideError(error: Error) {
    this.overrideError = error;
    this.overrideResponse = null;
  }

  async generate(request: SLMRequest): Promise<SLMResponse> {
    if (this.overrideError) throw this.overrideError;

    if (this.overrideResponse) {
       return {
          requestId: request.requestId,
          model: 'mock-model',
          output: this.overrideResponse.output || '',
          structuredOutput: this.overrideResponse.structuredOutput,
          finishReason: this.overrideResponse.finishReason || 'stop',
          latencyMs: this.overrideResponse.latencyMs || 50
       };
    }

    return {
      requestId: request.requestId,
      model: 'mock-model',
      output: 'Mock successful generation',
      structuredOutput: { decisionType: 'MODIFY_CODE', confidence: 0.9, targets: ['src/index.ts'] },
      finishReason: 'stop',
      latencyMs: 50
    };
  }

  async healthCheck(): Promise<boolean> {
    if (this.overrideError instanceof SLMUnavailableError) return false;
    return true;
  }

  async getCapabilities(): Promise<SLMCapabilities> {
    return {
      contextWindow: 8192,
      supportsStreaming: false,
      supportsStructuredOutput: true,
      supportsToolCalling: false,
      supportsEmbeddings: false,
      supportsVision: false,
      supportsSystemPrompt: true
    };
  }

  async getMetadata(): Promise<ModelMetadata> {
    return {
      provider: 'mock',
      modelName: 'mock-model',
      contextWindow: 8192,
      capabilities: await this.getCapabilities()
    };
  }

  async listModels(): Promise<ModelRecord[]> {
    return [{
      modelId: 'mock-mock-model',
      modelName: 'mock-model',
      providerId: 'mock',
      providerType: 'mock',
      capabilities: await this.getCapabilities(),
      contextWindow: 8192,
      availability: ModelAvailability.AVAILABLE,
      lastSeen: Date.now()
    }];
  }
}
