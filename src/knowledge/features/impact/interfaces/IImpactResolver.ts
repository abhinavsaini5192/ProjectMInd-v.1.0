import type { ChangeTarget } from '../models/ChangeTarget.js';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping.js';
import type { ImpactContext } from './IImpactSource.js';

export interface ResolvedImpactTargets {
  directFeatureIds: string[];
  affectedResourceIds: string[];
}

export interface IImpactResolver {
  resolveTarget(target: ChangeTarget, context: ImpactContext): Promise<ResolvedImpactTargets>;
  resolveFeatureResources(featureId: string, context: ImpactContext): Promise<FeatureResourceMapping[]>;
}
