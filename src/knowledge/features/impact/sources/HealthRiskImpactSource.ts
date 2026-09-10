import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class HealthRiskImpactSource implements IImpactSource {
  public readonly name = 'HEALTH_RISK' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    // HealthRisk is an evidence enricher and prioritization source.
    // Critical rule from Section 26:
    // "Do NOT let health/risk create impact by itself. Health is a prioritization signal, not proof of impact."
    //
    // Thus, detectImpacts returns candidates only for features that have existing directly changed targets,
    // enriching them with health-awareness evidence.
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableHealthPrioritization || !context.health) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const directFeatureId = target.featureId || (target.targetType === 'FEATURE' ? target.targetId : undefined);

      if (directFeatureId) {
        const featureHealth = context.health.get(directFeatureId);
        if (featureHealth) {
          const criticalityLevel = featureHealth.criticality?.level || 'LOW';
          const overallRiskScore = featureHealth.riskAssessment?.overallRiskScore || 0;

          const evidence = ChangeSourceHelper.createEvidence({
            source: 'HEALTH_RISK',
            sourceId: featureHealth.healthId,
            evidenceType: 'HEALTH_CRITICALITY_ASSESSMENT',
            description: `Target feature "${directFeatureId}" evaluated with criticality ${criticalityLevel} and risk score ${overallRiskScore}.`,
            confidence: 0.95,
            metadata: {
              criticality: criticalityLevel,
              riskScore: overallRiskScore,
              healthScore: featureHealth.healthScore?.overallScore ?? 100,
            },
          });

          candidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: change.changeId,
              targetFeatureId: directFeatureId,
              impactType: 'DIRECT',
              scope: 'FEATURE',
              direction: 'DOWNSTREAM',
              confidence: 'VERY_HIGH',
              severity: criticalityLevel === 'CRITICAL' ? 'CRITICAL' : criticalityLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
              direct: true,
              distance: 0,
              evidence: [evidence],
              contributingChanges: [target],
            })
          );
        }
      }
    }

    return candidates;
  }
}
