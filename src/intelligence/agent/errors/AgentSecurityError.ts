export class AgentSecurityError extends Error {
  constructor(
    message: string,
    public readonly violationType: 'PROMPT_INJECTION' | 'SECRET_LEAK' | 'FORBIDDEN_AUTONOMY' | 'UNAUTHORIZED_ACCESS',
    public readonly details?: Record<string, any>
  ) {
    super(`AgentSecurityError [${violationType}]: ${message}`);
    this.name = 'AgentSecurityError';
  }
}
