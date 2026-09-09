import type { FeatureHealthStatus } from './FeatureHealthStatus.js';
import type { FeatureHealthDimension, FeatureHealthDimensionResult } from './FeatureHealthDimension.js';

export interface FeatureHealthScore {
  overallScore: number; // 0 to 100
  status: FeatureHealthStatus;
  confidence: number; // 0 to 1
  dimensionScores: Record<FeatureHealthDimension, FeatureHealthDimensionResult>;
  computedAt: number;
}
