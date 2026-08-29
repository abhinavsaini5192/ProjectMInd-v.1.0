export class SLMConfigurationError extends Error {
  constructor(message: string) {
    super(`SLM Configuration Error: ${message}`);
    this.name = 'SLMConfigurationError';
  }
}
