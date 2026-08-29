export class SLMError extends Error {
  constructor(
    public readonly code: 'TIMEOUT' | 'PROVIDER_ERROR' | 'SCHEMA_ERROR' | 'HALLUCINATION' | 'SECURITY_REJECTION' | 'CAPABILITY_MISMATCH',
    message: string,
    public readonly requestId?: string,
    public readonly provider?: string
  ) {
    super(message);
    this.name = 'SLMError';
  }
}
