export class SLMUnavailableError extends Error {
  constructor(message: string, public provider: string, public model: string) {
    super(`SLM Unavailable (${provider}/${model}): ${message}`);
    this.name = 'SLMUnavailableError';
  }
}
