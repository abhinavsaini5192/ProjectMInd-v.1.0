export class SLMTimeoutError extends Error {
  constructor(message: string, public provider: string, public timeoutMs: number) {
    super(`SLM Timeout (${provider}): ${message} after ${timeoutMs}ms`);
    this.name = 'SLMTimeoutError';
  }
}
