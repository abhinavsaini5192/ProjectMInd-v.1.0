import type { IFeatureHealthSignal, HealthContext } from '../interfaces/IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import { HealthSignalHelper } from './HealthSignalHelper.js';

export class ChangeFrequencyHealthSignal implements IFeatureHealthSignal {
  public readonly id = 'ChangeFrequencyHealthSignal';
  public readonly signalType: HealthSignalType = 'HOTSPOT_DETECTED';

  public async compute(context: HealthContext): Promise<HealthSignal[]> {
    const signals: HealthSignal[] = [];
    const featureId = context.feature.featureId;
    const meta = (context.feature.metadata || {}) as Record<string, unknown>;

    const recentChangesCount = typeof meta.recentChangesCount === 'number' ? meta.recentChangesCount : 0;
    const isHotspot = meta.isHotspot === true;

    // Relative change frequency across all features if available
    let isRelativeHotspot = false;
    if (context.allFeatures && context.allFeatures.length > 3) {
      const allCounts = context.allFeatures.map((f) => {
        const m = (f.metadata || {}) as Record<string, unknown>;
        return typeof m.recentChangesCount === 'number' ? m.recentChangesCount : 0;
      });
      const avg = allCounts.reduce((a, b) => a + b, 0) / allCounts.length;
      if (recentChangesCount > avg * 2.5 && recentChangesCount >= 8) {
        isRelativeHotspot = true;
      }
    }

    if (isHotspot || isRelativeHotspot) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'HOTSPOT_DETECTED',
          severity: 'HIGH',
          value: recentChangesCount,
          normalizedValue: 80,
          description: `Feature identified as a codebase modification hotspot (${recentChangesCount} recent modifications).`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'CHANGE_INTELLIGENCE',
              sourceId: featureId,
              evidenceType: 'HOTSPOT_METRIC',
              description: `Change frequency is significantly higher than repository average.`,
              confidence: 0.92,
              metadata: { recentChangesCount }
            })
          ],
          source: this.id,
          confidence: 0.92
        })
      );
    }

    if (recentChangesCount >= 20) {
      signals.push(
        HealthSignalHelper.createSignal({
          featureId,
          signalType: 'RAPID_SUCCESSIVE_CHANGES',
          severity: 'MEDIUM',
          value: recentChangesCount,
          normalizedValue: 70,
          description: `Feature underwent rapid successive modifications in recent history.`,
          evidence: [
            HealthSignalHelper.createEvidence({
              sourceType: 'CHANGE_INTELLIGENCE',
              sourceId: featureId,
              evidenceType: 'CHANGE_VELOCITY',
              description: `High modification velocity with ${recentChangesCount} recorded changes.`,
              confidence: 0.85
            })
          ],
          source: this.id,
          confidence: 0.85
        })
      );
    }

    return signals;
  }
}
