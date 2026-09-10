import type { IImpactResolver, ResolvedImpactTargets } from '../interfaces/IImpactResolver.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ChangeTarget } from '../models/ChangeTarget.js';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping.js';

export class ImpactResolver implements IImpactResolver {
  public async resolveTarget(
    target: ChangeTarget,
    context: ImpactContext
  ): Promise<ResolvedImpactTargets> {
    const directFeatureIds = new Set<string>();
    const affectedResourceIds = new Set<string>();

    affectedResourceIds.add(target.targetId);
    if (target.filePath) affectedResourceIds.add(target.filePath);
    if (target.symbolName) affectedResourceIds.add(target.symbolName);

    // 1. If explicitly targeting a feature
    if (target.targetType === 'FEATURE' || target.featureId) {
      const fid = target.featureId || target.targetId;
      directFeatureIds.add(fid);
    }

    // 2. Lookup in mappings
    for (const m of context.mappings) {
      if (!m.active) continue;

      const isMatch =
        m.resourceId === target.targetId ||
        (target.symbolName && m.resourceId.includes(target.symbolName)) ||
        (target.filePath && m.resourceId === target.filePath) ||
        (target.name && m.resourceId.includes(target.name));

      if (isMatch) {
        directFeatureIds.add(m.featureId);
        affectedResourceIds.add(m.resourceId);
      }
    }

    return {
      directFeatureIds: Array.from(directFeatureIds),
      affectedResourceIds: Array.from(affectedResourceIds),
    };
  }

  public async resolveFeatureResources(
    featureId: string,
    context: ImpactContext
  ): Promise<FeatureResourceMapping[]> {
    return context.mappings.filter((m) => m.active && m.featureId === featureId);
  }
}
