import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class DocumentationFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'DOCUMENTATION';
  public readonly name = 'DocumentationFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.documentation || context.documentation.length === 0) {
      return evidenceList;
    }

    for (const doc of context.documentation) {
      // Documentation is untrusted data. Filter prompt injection attempts without crashing discovery.
      const sections = (doc.sections && doc.sections.length > 0)
        ? doc.sections
        : (doc.title ? [{ heading: doc.title, content: '' }] : []);
      for (const section of sections) {
        // Redact secrets and ignore adversarial instructions
        const safeHeading = SecuritySanitizer.redactSecrets(section.heading);
        const capability = CapabilityNameInferer.infer(safeHeading) || (doc.title ? CapabilityNameInferer.infer(doc.title) : null);

        if (!capability) continue;

        evidenceList.push({
          evidenceId: `ev_doc_${randomUUID().slice(0, 8)}`,
          sourceType: 'DOCUMENTATION',
          sourceId: `${doc.filePath}#${safeHeading}`,
          evidenceType: 'DOCUMENTATION_SECTION',
          description: `Documentation section "${safeHeading}" in ${doc.filePath} describes ${capability}`,
          targetCapability: capability,
          strength: 'MEDIUM',
          confidence: 0.68,
          resourceReference: {
            referenceId: `ref_doc_${randomUUID().slice(0, 8)}`,
            resourceType: 'FILE',
            resourceId: doc.filePath,
            role: 'DOCUMENTATION',
            confidence: 0.68,
          },
          timestamp: Date.now(),
          metadata: {
            filePath: doc.filePath,
            heading: safeHeading,
          },
        });
      }
    }

    return evidenceList;
  }
}
