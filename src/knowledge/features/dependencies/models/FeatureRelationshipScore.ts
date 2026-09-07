export interface FeatureRelationshipScoreBreakdown {
  endpointScore: number;
  codeDepScore: number;
  integrationScore: number;
  architectureScore: number;
  dataScore: number;
  moduleScore: number;
  sharedResourceScore: number;
  configScore: number;
  testScore: number;
  historyScore: number;
  coherenceScore: number;
  totalScore: number;
}

export interface FeatureRelationshipScoreConfig {
  sourceWeights: Record<string, number>;
  diversityBonus: number;
  strengthMultipliers: Record<string, number>;
}

export const DEFAULT_RELATIONSHIP_WEIGHTS: FeatureRelationshipScoreConfig = {
  sourceWeights: {
    ENDPOINT: 0.25,
    CODE_DEPENDENCY: 0.20,
    INTEGRATION: 0.15,
    ARCHITECTURE: 0.12,
    DATA: 0.10,
    MODULE: 0.08,
    SHARED_RESOURCE: 0.05,
    CONFIGURATION: 0.04,
    TEST: 0.03,
    HISTORY: 0.02,
  },
  diversityBonus: 0.10,
  strengthMultipliers: {
    VERY_STRONG: 1.0,
    STRONG: 0.85,
    MEDIUM: 0.60,
    WEAK: 0.30,
  },
};
