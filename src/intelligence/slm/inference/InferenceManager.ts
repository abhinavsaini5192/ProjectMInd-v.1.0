import { ModelSelectionResult } from '../models/ModelSelectionResult';
import { SLMRequest } from '../models/SLMRequest';
import { SLMResponse } from '../models/SLMResponse';
import { InferenceSession } from './InferenceSession';
import { SLMRuntime } from '../core/SLMRuntime';
import { ISLMProvider } from '../providers/ISLMProvider';
import { SLMConfig } from '../models/SLMConfig';
import { SLMTimeoutError } from '../errors/SLMTimeoutError';

export class InferenceManager {
  private activeSessions: Map<string, InferenceSession> = new Map();
  private providers: Map<string, ISLMProvider> = new Map();
  private baseConfig: SLMConfig;

  constructor(baseConfig: SLMConfig) {
    this.baseConfig = baseConfig;
  }

  public registerProvider(providerId: string, provider: ISLMProvider): void {
    this.providers.set(providerId, provider);
  }

  public async execute(selection: ModelSelectionResult, request: SLMRequest, brainSessionId?: string): Promise<SLMResponse> {
    const provider = this.providers.get(selection.selectedProviderId);
    if (!provider) {
       throw new Error(`Provider ${selection.selectedProviderId} not registered in InferenceManager`);
    }

    const sessionId = `inf_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const session: InferenceSession = {
       inferenceSessionId: sessionId,
       brainSessionId,
       modelId: selection.selectedModel.modelId,
       providerId: selection.selectedProviderId,
       startedAt: Date.now(),
       status: 'STARTED'
    };
    this.activeSessions.set(sessionId, session);

    // Create a runtime specifically for this request based on the selected model
    const runtimeConfig: SLMConfig = {
       ...this.baseConfig,
       provider: selection.selectedProviderId as any,
       model: selection.selectedModel.modelId,
       contextWindow: selection.selectedModel.contextWindow
    };
    const runtime = new SLMRuntime(provider, runtimeConfig);

    try {
      // SLMRequest model override to ensure correct model is targeted
      request.model = selection.selectedModel.modelId;
      const response = await runtime.generate(request);
      
      session.status = 'COMPLETED';
      session.completedAt = Date.now();
      session.latencyMs = response.latencyMs;
      session.tokenUsage = response.tokenUsage;
      
      return response;
    } catch (e: any) {
      session.status = e instanceof SLMTimeoutError ? 'TIMEOUT' : 'FAILED';
      session.completedAt = Date.now();
      session.latencyMs = Date.now() - session.startedAt;
      session.error = e;
      throw e;
    }
  }

  public getSession(sessionId: string): InferenceSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}
