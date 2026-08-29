export interface InferenceSession {
  inferenceSessionId: string;
  brainSessionId?: string;
  modelId: string;
  providerId: string;
  startedAt: number;
  completedAt?: number;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: Error;
}
