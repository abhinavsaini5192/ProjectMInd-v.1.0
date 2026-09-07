import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehaviorEvidence } from './FeatureBehaviorEvidence';

export type ConflictSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type ConflictStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface FeatureBehaviorConflict {
  conflictId: string;
  featureId: FeatureId;
  flowIds: string[];
  reason: string;
  severity: ConflictSeverity;
  evidence: FeatureBehaviorEvidence[];
  status: ConflictStatus;
  resolution?: string;
  detectedAt: number;
  resolvedAt?: number;
}
