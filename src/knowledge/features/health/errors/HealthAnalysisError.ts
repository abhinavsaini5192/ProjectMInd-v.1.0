import { FeatureHealthError } from './FeatureHealthError.js';

export class HealthAnalysisError extends FeatureHealthError {
  public readonly featureId?: string;

  constructor(message: string, featureId?: string, details?: Record<string, unknown>) {
    super(message, 'HEALTH_ANALYSIS_ERROR', { ...details, featureId });
    this.name = 'HealthAnalysisError';
    this.featureId = featureId;
  }
}
