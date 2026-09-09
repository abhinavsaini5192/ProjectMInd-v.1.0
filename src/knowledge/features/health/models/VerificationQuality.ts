import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export type VerificationLevel =
  | 'COMPREHENSIVE'
  | 'MODERATE'
  | 'MINIMAL'
  | 'NONE'
  | 'UNCERTAIN';

export const VERIFICATION_LEVELS: readonly VerificationLevel[] = [
  'COMPREHENSIVE',
  'MODERATE',
  'MINIMAL',
  'NONE',
  'UNCERTAIN'
] as const;

export function isVerificationLevel(value: unknown): value is VerificationLevel {
  return typeof value === 'string' && VERIFICATION_LEVELS.includes(value as VerificationLevel);
}

export interface VerificationQuality {
  score: number; // 0 to 100
  level: VerificationLevel;
  hasUnitTests: boolean;
  hasIntegrationTests: boolean;
  hasE2ETests: boolean;
  testFileCount: number;
  verifiedFlowCount: number;
  unverifiedFlowCount: number;
  testRatio: number; // Test resources / total resources
  confidence: number; // 0 to 1
  evidence: FeatureRiskEvidence[];
}
