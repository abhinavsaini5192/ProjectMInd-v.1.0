import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';

export class EndpointFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'ENDPOINT';
  public readonly name = 'EndpointFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.endpoints || context.endpoints.length === 0) {
      return evidenceList;
    }

    for (const ep of context.endpoints) {
      const capability =
        CapabilityNameInferer.infer(ep.path) ||
        (ep.handlerSymbolId ? CapabilityNameInferer.infer(ep.handlerSymbolId) : null) ||
        'API Endpoints';

      evidenceList.push({
        evidenceId: `ev_ep_${randomUUID().slice(0, 8)}`,
        sourceType: 'ENDPOINT',
        sourceId: `${ep.method.toUpperCase()} ${ep.path}`,
        evidenceType: 'API_ROUTE',
        description: `Exposes API route ${ep.method.toUpperCase()} ${ep.path}${ep.handlerSymbolId ? ` handled by ${ep.handlerSymbolId}` : ''}`,
        targetCapability: capability,
        strength: 'VERY_STRONG',
        confidence: 0.92,
        resourceReference: {
          referenceId: `ref_ep_${randomUUID().slice(0, 8)}`,
          resourceType: 'ENDPOINT',
          resourceId: `${ep.method.toUpperCase()} ${ep.path}`,
          role: 'API',
          confidence: 0.9,
        },
        timestamp: Date.now(),
        metadata: {
          method: ep.method,
          path: ep.path,
          handlerSymbolId: ep.handlerSymbolId,
          filePath: ep.filePath,
        },
      });
    }

    return evidenceList;
  }
}
