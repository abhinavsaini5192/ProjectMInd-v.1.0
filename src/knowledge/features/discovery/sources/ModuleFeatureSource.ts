import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';

export class ModuleFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'MODULE';
  public readonly name = 'ModuleFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.modules || context.modules.length === 0) {
      return evidenceList;
    }

    for (const mod of context.modules) {
      const capability = CapabilityNameInferer.infer(mod.name) || CapabilityNameInferer.infer(mod.path);
      if (!capability) continue;

      evidenceList.push({
        evidenceId: `ev_mod_${randomUUID().slice(0, 8)}`,
        sourceType: 'MODULE',
        sourceId: mod.id || mod.path,
        evidenceType: 'MODULE_STRUCTURE',
        description: `Module structure ${mod.name} located at ${mod.path}`,
        targetCapability: capability,
        strength: 'STRONG',
        confidence: 0.78,
        resourceReference: {
          referenceId: `ref_mod_${randomUUID().slice(0, 8)}`,
          resourceType: 'MODULE',
          resourceId: mod.path,
          role: 'IMPLEMENTATION',
          confidence: 0.8,
        },
        timestamp: Date.now(),
        metadata: {
          path: mod.path,
          exportsCount: mod.exports?.length || 0,
        },
      });
    }

    return evidenceList;
  }
}
