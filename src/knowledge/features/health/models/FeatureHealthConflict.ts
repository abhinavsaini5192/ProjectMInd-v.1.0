import type { HealthSignalSeverity } from './HealthSignalSeverity.js';
import type { FeatureRiskEvidence } from './FeatureRiskEvidence.js';

export type FeatureHealthConflictType =
  | 'DISPUTED_SIGNAL'
  | 'COMPETING_EVIDENCE'
  | 'INCONSISTENT_METRIC'
  | 'MANUAL_OVERRIDE';

export type FeatureHealthConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED'
  | 'IGNORED'
  | 'SUPERSEDED';

export interface FeatureHealthConflict {
  conflictId: string;
  featureId: string;
  conflictType: FeatureHealthConflictType;
  description: string;
  competingEvidence: FeatureRiskEvidence[];
  severity: HealthSignalSeverity;
  confidence: number; // 0 to 1
  resolutionStatus: FeatureHealthConflictResolutionStatus;
  resolution?: string;
  detectedAt: number;
}
