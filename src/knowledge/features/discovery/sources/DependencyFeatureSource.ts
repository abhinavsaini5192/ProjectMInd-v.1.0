import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';

export class DependencyFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'DEPENDENCY';
  public readonly name = 'DependencyFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.dependencies || context.dependencies.length === 0) {
      return evidenceList;
    }

    // Group dependencies by cohesive clusters
    const chainMap = new Map<string, Set<string>>();
    for (const dep of context.dependencies) {
      const src = dep.sourceId || (dep as any).source;
      const tgt = dep.targetId || (dep as any).target;
      if (!src || !tgt) continue;
      if (!chainMap.has(src)) {
        chainMap.set(src, new Set());
      }
      chainMap.get(src)!.add(tgt);
    }

    for (const [sourceId, targets] of chainMap.entries()) {
      const sourceCap = CapabilityNameInferer.infer(sourceId);
      const targetCaps = Array.from(targets).map(t => CapabilityNameInferer.infer(t)).filter(Boolean);

      const dominantCapability = sourceCap || targetCaps[0];
      if (!dominantCapability) continue;

      evidenceList.push({
        evidenceId: `ev_dep_${randomUUID().slice(0, 8)}`,
        sourceType: 'DEPENDENCY',
        sourceId: `${sourceId} -> [${Array.from(targets).join(', ')}]`,
        evidenceType: 'DEPENDENCY_CHAIN',
        description: `Component dependency chain from ${sourceId} to ${Array.from(targets).join(', ')}`,
        targetCapability: dominantCapability,
        strength: 'STRONG',
        confidence: 0.82,
        resourceReference: {
          referenceId: `ref_dep_${randomUUID().slice(0, 8)}`,
          resourceType: 'DEPENDENCY',
          resourceId: `${sourceId}->${Array.from(targets)[0]}`,
          role: 'DEPENDENCY',
          confidence: 0.8,
        },
        timestamp: Date.now(),
        metadata: {
          sourceId,
          targetCount: targets.size,
        },
      });
    }

    return evidenceList;
  }
}
