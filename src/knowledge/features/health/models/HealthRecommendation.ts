import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export type HealthRecommendationCategory =
  | 'REFACTORING'
  | 'TESTING'
  | 'SECURITY'
  | 'ARCHITECTURE'
  | 'DOCUMENTATION'
  | 'STABILIZATION';

export type HealthRecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface HealthRecommendation {
  recommendationId: string;
  featureId: string;
  category: HealthRecommendationCategory;
  priority: HealthRecommendationPriority;
  title: string;
  description: string;
  actionableSteps: string[];
  evidence: FeatureRiskEvidence[];
  relatedRiskIds: string[];
  confidence: number; // 0 to 1
  createdAt: number;
}
