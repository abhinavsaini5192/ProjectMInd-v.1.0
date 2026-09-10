import type { ImpactEvidence } from '../models/ImpactEvidence.js';
import type { ImpactSource } from '../models/ImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactType } from '../models/ImpactType.js';
import type { ImpactScope } from '../models/ImpactScope.js';
import type { ImpactDirection } from '../models/ImpactDirection.js';
import type { ImpactSeverity } from '../models/ImpactSeverity.js';
import type { ImpactConfidence } from '../models/ImpactConfidence.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ChangeTarget } from '../models/ChangeTarget.js';

export class ChangeSourceHelper {
  private static candidateCounter = 0;
  private static evidenceCounter = 0;

  public static createEvidence(params: {
    source: ImpactSource;
    sourceId: string;
    evidenceType: string;
    description: string;
    confidence: number;
    metadata?: Record<string, any>;
  }): ImpactEvidence {
    return {
      evidenceId: `ev_${Date.now()}_${++this.evidenceCounter}`,
      source: params.source,
      sourceId: params.sourceId,
      evidenceType: params.evidenceType,
      description: params.description,
      confidence: Math.max(0, Math.min(1, params.confidence)),
      ...(params.metadata ? { metadata: params.metadata } : {}),
    };
  }

  public static createCandidate(params: {
    sourceChangeId: string;
    targetFeatureId?: string | undefined;
    targetResourceId?: string | undefined;
    targetResourceType?: string | undefined;
    impactType: ImpactType;
    scope: ImpactScope;
    direction?: ImpactDirection | undefined;
    confidence: ImpactConfidence;
    severity?: ImpactSeverity | undefined;
    direct: boolean;
    distance: number;
    evidence: ImpactEvidence[];
    path?: ImpactPath | undefined;
    contributingChanges: ChangeTarget[];
    metadata?: Record<string, any> | undefined;
  }): ImpactCandidate {
    const now = Date.now();
    return {
      candidateId: `cand_${now}_${++this.candidateCounter}`,
      sourceChangeId: params.sourceChangeId,
      targetFeatureId: params.targetFeatureId,
      targetResourceId: params.targetResourceId,
      targetResourceType: params.targetResourceType,
      impactType: params.impactType,
      scope: params.scope,
      direction: params.direction ?? 'DOWNSTREAM',
      status: 'DETECTED',
      confidence: params.confidence,
      severity: params.severity ?? 'MEDIUM',
      direct: params.direct,
      distance: params.distance,
      evidence: params.evidence,
      path: params.path,
      contributingChanges: params.contributingChanges,
      createdAt: now,
      updatedAt: now,
      ...(params.metadata ? { metadata: params.metadata } : {}),
    };
  }
}
