export class SLMResponseError extends Error {
  constructor(message: string, public provider: string, public rawResponse: string) {
    super(`SLM Response Error (${provider}): ${message}`);
    this.name = 'SLMResponseError';
  }
}
