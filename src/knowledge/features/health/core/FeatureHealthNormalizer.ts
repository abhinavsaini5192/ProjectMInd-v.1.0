import type { FeatureHealthDimension } from '../models/FeatureHealthDimension.js';
import { FEATURE_HEALTH_DIMENSIONS } from '../models/FeatureHealthDimension.js';

export class FeatureHealthNormalizer {
  public static normalizeScore(val: number): number {
    if (isNaN(val) || !isFinite(val)) return 50;
    return Math.max(0, Math.min(100, Math.round(val)));
  }

  public static normalizeConfidence(val: number): number {
    if (isNaN(val) || !isFinite(val)) return 0.5;
    return Number(Math.max(0, Math.min(1, val)).toFixed(2));
  }

  public static normalizeWeights(
    weights: Record<FeatureHealthDimension, number>
  ): Record<FeatureHealthDimension, number> {
    const normalized = {} as Record<FeatureHealthDimension, number>;
    let total = 0;

    for (const dim of FEATURE_HEALTH_DIMENSIONS) {
      const w = typeof weights[dim] === 'number' && weights[dim] > 0 ? weights[dim] : 0.1;
      normalized[dim] = w;
      total += w;
    }

    if (total > 0 && Math.abs(total - 1.0) > 0.001) {
      for (const dim of FEATURE_HEALTH_DIMENSIONS) {
        normalized[dim] = Number((normalized[dim] / total).toFixed(4));
      }
    }

    return normalized;
  }
}
