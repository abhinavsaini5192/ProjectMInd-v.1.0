export class FeatureError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`FeatureError: ${message}`);
    this.name = 'FeatureError';
  }
}
