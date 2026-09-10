import type { ImpactType } from './ImpactType.js';
import type { ImpactScope } from './ImpactScope.js';
import type { ImpactDirection } from './ImpactDirection.js';
import type { ImpactStatus } from './ImpactStatus.js';
import type { ImpactConfidence } from './ImpactConfidence.js';
import type { ImpactSeverity } from './ImpactSeverity.js';
import type { ImpactEvidence } from './ImpactEvidence.js';
import type { ImpactPath } from './ImpactPath.js';
import type { ChangeTarget } from './ChangeTarget.js';

export interface ImpactCandidate {
  candidateId: string;
  sourceChangeId: string;
  targetFeatureId?: string | undefined;
  targetResourceId?: string | undefined;
  targetResourceType?: string | undefined;
  impactType: ImpactType;
  scope: ImpactScope;
  direction: ImpactDirection;
  status: ImpactStatus;
  confidence: ImpactConfidence;
  severity: ImpactSeverity;
  score?: number | undefined;
  direct: boolean;
  distance: number;
  evidence: ImpactEvidence[];
  path?: ImpactPath | undefined;
  contributingChanges: ChangeTarget[];
  rejectionReason?: string | undefined;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any> | undefined;
}
