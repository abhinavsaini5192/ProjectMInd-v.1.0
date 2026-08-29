export interface SLMRequest {
  requestId: string;
  sessionId?: string;
  model: string;
  systemInstructions?: string;
  userInput: string;
  structuredContext?: any;
  generationParameters?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
  };
  maxOutputTokens?: number;
  timeout?: number;
  metadata?: Record<string, any>;
}
