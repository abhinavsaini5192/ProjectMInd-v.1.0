import type { ChangeTarget } from '../models/ChangeTarget.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { ChangeType } from '../models/ChangeType.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactEvidence } from '../models/ImpactEvidence.js';
import type { ImpactType } from '../models/ImpactType.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import { confidenceToNumeric, numericToConfidence } from '../models/ImpactConfidence.js';

export interface RawChangeInput {
  targetId?: string | undefined;
  filePath?: string | undefined;
  symbolName?: string | undefined;
  changeType?: string | undefined;
  diffSnippet?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  featureId?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

export class ImpactNormalizer {
  /**
   * Normalize various raw change representations into a canonical ChangeImpact.
   */
  public static normalizeChange(raw: RawChangeInput | ChangeImpact): ChangeImpact {
    if ('changeId' in raw && 'target' in raw) {
      return raw as ChangeImpact;
    }

    const targetId = raw.targetId || raw.filePath || raw.symbolName || `target_${Date.now()}`;
    let targetType: any = 'FILE';
    if (raw.symbolName) targetType = 'SYMBOL';
    else if (raw.featureId) targetType = 'FEATURE';
    else if (raw.filePath && /\.test\.|\.spec\./i.test(raw.filePath)) targetType = 'TEST';
    else if (raw.name && /table|entity|schema/i.test(raw.name)) targetType = 'DATABASE_ENTITY';
    else if (raw.name && /^(GET|POST|PUT|DELETE|PATCH)/i.test(raw.name)) targetType = 'ENDPOINT';

    let changeType: ChangeType = 'MODIFIED';
    if (raw.changeType) {
      const ctUpper = raw.changeType.toUpperCase();
      if (['CREATED', 'ADDED', 'NEW'].includes(ctUpper)) changeType = 'CREATED';
      else if (['DELETED', 'REMOVED'].includes(ctUpper)) changeType = 'DELETED';
      else if (['RENAMED'].includes(ctUpper)) changeType = 'RENAMED';
      else if (['MOVED'].includes(ctUpper)) changeType = 'MOVED';
      else if (['SIGNATURE_CHANGED'].includes(ctUpper)) changeType = 'SIGNATURE_CHANGED';
      else if (['API_CHANGED'].includes(ctUpper)) changeType = 'API_CHANGED';
      else if (['BEHAVIOR_CHANGED'].includes(ctUpper)) changeType = 'BEHAVIOR_CHANGED';
      else if (['DATA_SCHEMA_CHANGED'].includes(ctUpper)) changeType = 'DATA_SCHEMA_CHANGED';
    }

    const target: ChangeTarget = {
      targetId,
      targetType,
      name: raw.name || raw.symbolName || raw.filePath,
      filePath: raw.filePath,
      symbolName: raw.symbolName,
      featureId: raw.featureId,
      metadata: raw.metadata,
    };

    return {
      changeId: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      target,
      changeType,
      diffSnippet: raw.diffSnippet,
      description: raw.description,
      timestamp: Date.now(),
      metadata: raw.metadata,
    };
  }

  /**
   * Collapses multiple candidates for the same feature into ONE logical FeatureImpact
   * with aggregated evidence, preserving maximum severity and highest score (Section 33).
   */
  public static normalizeFeatureCandidates(
    candidates: ImpactCandidate[],
    context: ImpactContext
  ): FeatureImpact[] {
    const grouped = new Map<string, ImpactCandidate[]>();

    for (const cand of candidates) {
      if (!cand.targetFeatureId) continue;
      if (!grouped.has(cand.targetFeatureId)) {
        grouped.set(cand.targetFeatureId, []);
      }
      grouped.get(cand.targetFeatureId)!.push(cand);
    }

    const results: FeatureImpact[] = [];
    const now = Date.now();

    for (const [featureId, cList] of grouped.entries()) {
      // Find feature criticality and risks from health if available
      const health = context.health.get(featureId);
      const criticality = health?.criticality?.level || 'MEDIUM';
      const relatedRisks = health?.riskAssessment?.risks ? health.riskAssessment.risks.map((r: any) => r.riskType) : [];

      // Determine if any candidate is direct
      const direct = cList.some((c) => c.direct);
      const minDistance = Math.min(...cList.map((c) => c.distance));

      // Aggregate all evidence and path IDs
      const evidenceMap = new Map<string, ImpactEvidence>();
      const pathIds = new Set<string>();
      const contributingChanges: ChangeTarget[] = [];

      for (const c of cList) {
        for (const ev of c.evidence) {
          evidenceMap.set(ev.evidenceId, ev);
        }
        if (c.path) {
          pathIds.add(c.path.pathId);
        }
        for (const chg of c.contributingChanges) {
          if (!contributingChanges.some((existing) => existing.targetId === chg.targetId)) {
            contributingChanges.push(chg);
          }
        }
      }

      // Aggregate confidence score
      const maxConfScore = Math.max(...cList.map((c) => confidenceToNumeric(c.confidence)));
      const confidence = numericToConfidence(maxConfScore);

      // Determine primary impact type
      let primaryType: ImpactType = 'INDIRECT';
      if (cList.some((c) => c.impactType === 'API')) primaryType = 'API';
      else if (cList.some((c) => c.impactType === 'DATA')) primaryType = 'DATA';
      else if (cList.some((c) => c.impactType === 'INTEGRATION')) primaryType = 'INTEGRATION';
      else if (cList.some((c) => c.impactType === 'BEHAVIORAL')) primaryType = 'BEHAVIORAL';
      else if (direct) primaryType = 'DIRECT';
      else if (cList.some((c) => c.impactType === 'DEPENDENCY')) primaryType = 'DEPENDENCY';
      else if (cList.some((c) => c.impactType === 'ARCHITECTURAL')) primaryType = 'ARCHITECTURAL';
      else if (cList.some((c) => c.impactType === 'VERIFICATION')) primaryType = 'VERIFICATION';

      // Pick highest severity
      const severityOrder = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      let highestSevIndex = 0;
      for (const c of cList) {
        const idx = severityOrder.indexOf(c.severity);
        if (idx > highestSevIndex) highestSevIndex = idx;
      }
      const severity = severityOrder[highestSevIndex] as any;

      // Pick highest score
      const maxScore = Math.max(...cList.map((c) => c.score ?? 50));

      results.push({
        impactId: `fimp_${featureId}_${now}`,
        targetFeatureId: featureId,
        impactType: primaryType,
        impactScope: 'FEATURE',
        direction: 'DOWNSTREAM',
        severity,
        score: maxScore,
        confidence,
        direct,
        distance: minDistance,
        evidence: Array.from(evidenceMap.values()),
        impactPathIds: Array.from(pathIds),
        contributingChanges,
        criticality,
        relatedRisks,
        knowledgeVersion: context.options.sourceChangeVersion || '1.0.0',
        impactVersion: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return results;
  }

  /**
   * Collapses candidates targeting resources into ResourceImpact records.
   */
  public static normalizeResourceCandidates(
    candidates: ImpactCandidate[],
    context: ImpactContext
  ): ResourceImpact[] {
    const grouped = new Map<string, ImpactCandidate[]>();

    for (const cand of candidates) {
      if (!cand.targetResourceId) continue;
      if (!grouped.has(cand.targetResourceId)) {
        grouped.set(cand.targetResourceId, []);
      }
      grouped.get(cand.targetResourceId)!.push(cand);
    }

    const results: ResourceImpact[] = [];
    const now = Date.now();

    for (const [resourceId, cList] of grouped.entries()) {
      const first = cList[0]!;
      const primaryChange = first.contributingChanges[0] || {
        targetId: resourceId,
        targetType: 'FILE',
      };

      const evidenceMap = new Map<string, ImpactEvidence>();
      const pathIds = new Set<string>();

      for (const c of cList) {
        for (const ev of c.evidence) {
          evidenceMap.set(ev.evidenceId, ev);
        }
        if (c.path) {
          pathIds.add(c.path.pathId);
        }
      }

      const maxScore = Math.max(...cList.map((c) => c.score ?? 50));
      const maxConfScore = Math.max(...cList.map((c) => confidenceToNumeric(c.confidence)));

      results.push({
        impactId: `rimp_${resourceId.replace(/[^a-zA-Z0-9]/g, '_')}_${now}`,
        changeTarget: primaryChange,
        affectedResourceId: resourceId,
        affectedResourceType: first.targetResourceType || 'RESOURCE',
        impactType: first.impactType,
        scope: first.scope,
        severity: first.severity,
        score: maxScore,
        confidence: numericToConfidence(maxConfScore),
        evidence: Array.from(evidenceMap.values()),
        pathIds: Array.from(pathIds),
        active: true,
        knowledgeVersion: context.options.sourceChangeVersion || '1.0.0',
        createdAt: now,
        updatedAt: now,
      });
    }

    return results;
  }
}
