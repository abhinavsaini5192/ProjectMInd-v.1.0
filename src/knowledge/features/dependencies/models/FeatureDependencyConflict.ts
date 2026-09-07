import type { FeatureRelationship } from './FeatureRelationship';
import type { FeatureRelationshipEvidence } from './FeatureRelationshipEvidence';

export type ConflictSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type ConflictStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface FeatureDependencyConflict {
  conflictId: string;
  sourceFeatureId: string;
  targetFeatureId: string;
  relationships: FeatureRelationship[];
  reason: string;
  severity: ConflictSeverity;
  evidence: FeatureRelationshipEvidence[];
  status: ConflictStatus;
  createdAt: number;
}
