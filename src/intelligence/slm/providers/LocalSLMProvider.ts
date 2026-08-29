import { ISLMProvider } from '../interfaces/ISLMProvider';
import { SLMRequest } from '../models/SLMRequest';
import { SLMResponse } from '../models/SLMResponse';
import { SLMCapabilities } from '../models/SLMCapabilities';

export class LocalSLMProvider implements ISLMProvider {
  getCapabilities(): SLMCapabilities {
    return {
      model: 'local-onnx-llama-3-8b', // Placeholder
      provider: 'local-onnx',
      supportedTasks: ['FEATURE_INTERPRETATION', 'CONTEXT_RANKING'],
      maxContextTokens: 8192,
      structuredOutputSupported: true
    };
  }

  async isHealthy(): Promise<boolean> {
    // In reality, this would check if the local inference engine (e.g. ONNX Runtime) is loaded and ready
    return false; // Not implemented for this phase
  }

  async predict(request: SLMRequest): Promise<SLMResponse> {
    throw new Error('LocalSLMProvider inference not implemented yet.');
  }
}
