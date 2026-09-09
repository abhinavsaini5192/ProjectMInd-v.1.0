import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class StabilityHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'StabilityHealthSignal';
  public readonly signalType: HealthSignalType = 'HIGH_CHURN_RATE';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const feature = context.feature;
    const featureId = feature.featureId;
    const churnThreshold = context.config?.highChurnThreshold ?? 15;

    // Extract stability metrics from feature metadata or mappings
    const meta = (feature.metadata || {}) as Record<string, unknown>;
    const commitCount = typeof meta.commitCount === 'number' ? meta.commitCount : 0;
    const churnScore = typeof meta.churnScore === 'number' ? meta.churnScore : 0;
    const bugFixCount = typeof meta.bugFixCount === 'number' ? meta.bugFixCount : 0;
    const hasBreakingChanges = meta.recentBreakingChange === true;

    if (churnScore >= churnThreshold || commitCount > 40) {
      const value = churnScore || commitCount;
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'HIGH_CHURN_RATE',
          severity: value > churnThreshold * 2 ? 'HIGH' : 'MEDIUM',
          value,
          normalizedValue: Math.min(100, Math.round((value / churnThreshold) * 50)),
          description: `Feature exhibits high modification churn (${value} recent changes).`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'VERSION_CONTROL_HISTORY',
              sourceId: featureId,
              evidenceType: 'CHURN_RATE',
              description: `Churn metric is ${value} (threshold: ${churnThreshold}).`,
              confidence: 0.9,
              metadata: { commitCount, churnScore }
            })
          ],
          source: this.id,
          confidence: 0.9
        })
      );
    }

    if (bugFixCount >= 5) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'FREQUENT_BUG_FIXES',
          severity: bugFixCount >= 10 ? 'HIGH' : 'MEDIUM',
          value: bugFixCount,
          normalizedValue: Math.min(100, bugFixCount * 10),
          description: `Feature has undergone frequent bug fixes (${bugFixCount} fixes recently).`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'VERSION_CONTROL_HISTORY',
              sourceId: featureId,
              evidenceType: 'BUG_FIX_FREQUENCY',
              description: `Found ${bugFixCount} bug-fix commits targeting this feature.`,
              confidence: 0.88
            })
          ],
          source: this.id,
          confidence: 0.88
        })
      );
    }

    if (hasBreakingChanges) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'RECENT_BREAKING_CHANGE',
          severity: 'HIGH',
          value: true,
          normalizedValue: 85,
          description: `Recent breaking change detected in feature interface or behavior.`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'CHANGE_INTELLIGENCE',
              sourceId: featureId,
              evidenceType: 'BREAKING_CHANGE_FLAG',
              description: `Breaking change flag is active in feature metadata.`,
              confidence: 0.95
            })
          ],
          source: this.id,
          confidence: 0.95
        })
      );
    }

    return signals;
  }
}
