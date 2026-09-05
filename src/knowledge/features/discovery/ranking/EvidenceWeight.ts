import type { DiscoverySourceType } from '../models/DiscoverySource';

export interface EvidenceWeightConfig {
  sourceWeights: Record<DiscoverySourceType, number>;
  strengthMultipliers: {
    VERY_STRONG: number;
    STRONG: number;
    MEDIUM: number;
    WEAK: number;
  };
  diversityBonus: number; // Bonus when evidence comes from 3+ distinct sources
}

export const DEFAULT_EVIDENCE_WEIGHTS: EvidenceWeightConfig = {
  sourceWeights: {
    ENDPOINT: 0.25,
    SYMBOL: 0.20,
    TEST: 0.20,
    DEPENDENCY: 0.15,
    MODULE: 0.08,
    CONFIGURATION: 0.05,
    DOCUMENTATION: 0.04,
    HISTORY: 0.03,
  },
  strengthMultipliers: {
    VERY_STRONG: 1.0,
    STRONG: 0.8,
    MEDIUM: 0.5,
    WEAK: 0.2,
  },
  diversityBonus: 0.1,
};
