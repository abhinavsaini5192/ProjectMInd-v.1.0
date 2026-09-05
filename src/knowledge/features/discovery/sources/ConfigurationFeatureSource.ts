import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class ConfigurationFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'CONFIGURATION';
  public readonly name = 'ConfigurationFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.configurations || context.configurations.length === 0) {
      return evidenceList;
    }

    for (const config of context.configurations) {
      // NEVER expose raw secret values. Redact any potentially sensitive configuration content.
      const safeKey = SecuritySanitizer.redactSecrets(config.key);
      const capability = CapabilityNameInferer.infer(config.key) || (config.category ? CapabilityNameInferer.infer(config.category) : null);

      if (!capability) continue;

      evidenceList.push({
        evidenceId: `ev_cfg_${randomUUID().slice(0, 8)}`,
        sourceType: 'CONFIGURATION',
        sourceId: safeKey,
        evidenceType: 'CONFIGURATION_KEY',
        description: `Configuration key "${safeKey}" in ${config.filePath || 'environment'} supports ${capability}`,
        targetCapability: capability,
        strength: 'MEDIUM',
        confidence: 0.72,
        resourceReference: {
          referenceId: `ref_cfg_${randomUUID().slice(0, 8)}`,
          resourceType: 'CONFIGURATION',
          resourceId: safeKey,
          role: 'CONFIGURATION',
          confidence: 0.72,
        },
        timestamp: Date.now(),
        metadata: {
          key: safeKey,
          category: config.category,
          filePath: config.filePath,
        },
      });
    }

    return evidenceList;
  }
}
