export interface SLMResponse {
  requestId: string;
  model: string;
  output: string;
  structuredOutput?: any;
  finishReason: 'stop' | 'length' | 'timeout' | 'error' | 'unknown';
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  metadata?: Record<string, any>;
}
