export class ContextAssemblyError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`ContextAssemblyError: ${message}`);
    this.name = 'ContextAssemblyError';
  }
}
