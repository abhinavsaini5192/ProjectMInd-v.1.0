export class FeatureDiscoveryError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(`FeatureDiscoveryError: ${message}`);
    this.name = 'FeatureDiscoveryError';
  }
}
