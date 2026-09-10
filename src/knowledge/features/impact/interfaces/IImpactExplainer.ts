import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';

export interface IImpactExplainer {
  explainChange(
    change: ChangeImpact,
    featureImpacts: FeatureImpact[],
    resourceImpacts: ResourceImpact[],
    paths: ImpactPath[]
  ): string;

  explainFeatureImpact(
    impact: FeatureImpact,
    paths?: ImpactPath[],
    relatedTests?: ResourceImpact[]
  ): string;

  explainWhyAffected(
    targetFeatureId: string,
    featureImpacts: FeatureImpact[],
    paths: ImpactPath[]
  ): string;

  explainImpactPath(path: ImpactPath): string;
}
