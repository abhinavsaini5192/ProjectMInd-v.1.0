import type { ChangeTarget } from './ChangeTarget.js';
import type { ImpactType } from './ImpactType.js';
import type { ImpactScope } from './ImpactScope.js';
import type { ImpactSeverity } from './ImpactSeverity.js';
import type { ImpactConfidence } from './ImpactConfidence.js';
import type { ImpactEvidence } from './ImpactEvidence.js';

export interface ResourceImpact {
  impactId: string;
  changeTarget: ChangeTarget;
  affectedResourceId: string;
  affectedResourceType: string;
  impactType: ImpactType;
  scope: ImpactScope;
  severity: ImpactSeverity;
  score: number;
  confidence: ImpactConfidence;
  evidence: ImpactEvidence[];
  pathIds: string[];
  active: boolean;
  knowledgeVersion: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any> | undefined;
}
