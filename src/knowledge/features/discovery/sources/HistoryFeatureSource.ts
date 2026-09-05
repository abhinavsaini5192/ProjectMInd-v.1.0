import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class HistoryFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'HISTORY';
  public readonly name = 'HistoryFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.history || context.history.length === 0) {
      return evidenceList;
    }

    for (const item of context.history) {
      const sanitizedMessage = SecuritySanitizer.redactSecrets(item.message);
      const capability = CapabilityNameInferer.infer(sanitizedMessage);
      if (!capability) continue;

      evidenceList.push({
        evidenceId: `ev_hist_${randomUUID().slice(0, 8)}`,
        sourceType: 'HISTORY',
        sourceId: item.commitHash,
        evidenceType: 'COMMIT_HISTORY',
        description: `Commit ${item.commitHash.slice(0, 7)}: "${sanitizedMessage}" references ${capability}`,
        targetCapability: capability,
        strength: 'MEDIUM',
        confidence: 0.65,
        resourceReference: {
          referenceId: `ref_hist_${randomUUID().slice(0, 8)}`,
          resourceType: 'COMMAND',
          resourceId: item.commitHash,
          role: 'OBSERVABILITY',
          confidence: 0.65,
        },
        timestamp: item.timestamp || Date.now(),
        metadata: {
          commitHash: item.commitHash,
          changedFiles: item.changedFiles,
        },
      });
    }

    return evidenceList;
  }
}
