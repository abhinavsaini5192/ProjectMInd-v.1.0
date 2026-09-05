export interface MappingScoreBreakdown {
  endpointScore: number;
  symbolScore: number;
  dependencyScore: number;
  moduleScore: number;
  fileScore: number;
  testScore: number;
  configScore: number;
  databaseScore: number;
  uiScore: number;
  commandScore: number;
  docScore: number;
  coherenceScore: number;
  totalScore: number;
}

export interface MappingScoreConfig {
  sourceWeights: Record<string, number>;
  diversityBonus: number;
  strengthMultipliers: Record<string, number>;
}

export const DEFAULT_MAPPING_WEIGHTS: MappingScoreConfig = {
  sourceWeights: {
    ENDPOINT: 0.25,
    SYMBOL: 0.20,
    TEST: 0.15,
    DEPENDENCY: 0.10,
    DATABASE: 0.08,
    DATABASE_ENTITY: 0.08,
    FILE: 0.06,
    MODULE: 0.05,
    CONFIGURATION: 0.04,
    UI_COMPONENT: 0.03,
    COMMAND: 0.02,
    DOCUMENTATION: 0.02,
  },
  diversityBonus: 0.10,
  strengthMultipliers: {
    VERY_STRONG: 1.0,
    STRONG: 0.8,
    MEDIUM: 0.6,
    WEAK: 0.3,
  },
};
