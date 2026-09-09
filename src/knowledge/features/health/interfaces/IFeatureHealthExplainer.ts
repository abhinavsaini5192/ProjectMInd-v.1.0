import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureCriticality } from '../models/FeatureCriticality.js';

export interface IFeatureHealthExplainer {
  explainHealth(health: FeatureHealth): string;
  explainRisk(risk: FeatureRisk): string;
  explainCriticality(criticality: FeatureCriticality): string;
}
