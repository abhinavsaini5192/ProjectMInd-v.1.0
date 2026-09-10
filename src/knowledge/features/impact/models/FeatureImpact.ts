import type { ImpactType } from './ImpactType.js';
import type { ImpactScope } from './ImpactScope.js';
import type { ImpactDirection } from './ImpactDirection.js';
import type { ImpactSeverity } from './ImpactSeverity.js';
import type { ImpactConfidence } from './ImpactConfidence.js';
import type { ImpactEvidence } from './ImpactEvidence.js';
import type { ChangeTarget } from './ChangeTarget.js';

export interface FeatureImpact {
  impactId: string;
  sourceFeatureId?: string | undefined;
  targetFeatureId: string;
  impactType: ImpactType;
  impactScope: ImpactScope;
  direction: ImpactDirection;
  severity: ImpactSeverity;
  score: number;
  confidence: ImpactConfidence;
  direct: boolean;
  distance: number;
  evidence: ImpactEvidence[];
  impactPathIds: string[];
  contributingChanges: ChangeTarget[];
  criticality: string;
  relatedRisks?: string[] | undefined;
  knowledgeVersion: string;
  impactVersion: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any> | undefined;
}
