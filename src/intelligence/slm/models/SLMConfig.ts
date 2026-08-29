export interface SLMConfig {
  provider: 'local' | 'ollama' | 'openai' | 'mock';
  model: string;
  endpoint: string;
  temperature: number;
  contextWindow: number;
  maxOutputTokens: number;
  timeout: number;
}
