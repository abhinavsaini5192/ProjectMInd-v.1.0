import type { HealthContext } from './IFeatureHealthSignal.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';

export interface IFeatureRiskDetector {
  readonly id: string;
  readonly riskType: FeatureRiskType;
  detect(context: HealthContext, signals: HealthSignal[]): Promise<FeatureRisk[]>;
}
