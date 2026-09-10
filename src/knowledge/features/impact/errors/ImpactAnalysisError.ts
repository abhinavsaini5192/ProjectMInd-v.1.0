import { FeatureImpactError } from './FeatureImpactError.js';

export class ImpactAnalysisError extends FeatureImpactError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'IMPACT_ANALYSIS_ERROR', details);
    this.name = 'ImpactAnalysisError';
  }
}
