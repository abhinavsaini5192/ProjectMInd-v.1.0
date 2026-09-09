import { FeatureHealthError } from './FeatureHealthError.js';

export class RiskAssessmentError extends FeatureHealthError {
  public readonly featureId?: string;

  constructor(message: string, featureId?: string, details?: Record<string, unknown>) {
    super(message, 'RISK_ASSESSMENT_ERROR', { ...details, featureId });
    this.name = 'RiskAssessmentError';
    this.featureId = featureId;
  }
}
