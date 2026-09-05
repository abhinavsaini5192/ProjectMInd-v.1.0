import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class DocumentationMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'DOCUMENTATION';
  public readonly name = 'DocumentationMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'DOCUMENTATION';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.documentation) return candidates;

    for (const doc of context.documentation) {
      // Treat documentation purely as untrusted text evidence
      const sections = doc.sections && doc.sections.length > 0
        ? doc.sections
        : (doc.title ? [{ heading: doc.title, content: '' }] : []);

      for (const section of sections) {
        // Redact secrets and ignore adversarial instructions
        const safeHeading = SecuritySanitizer.redactSecrets(section.heading);
        const match = MappingMatcher.matchesFeature(feature, safeHeading);

        if (match.matches) {
          const resourceId = `${doc.filePath}#${safeHeading}`;
          const candidate: MappingCandidate = {
            candidateId: `cand_doc_${randomUUID().slice(0, 8)}`,
            featureId: feature.id,
            resourceId,
            resourceType: 'DOCUMENTATION',
            proposedRole: 'DOCUMENTATION',
            evidence: [
              {
                evidenceId: `ev_doc_${randomUUID().slice(0, 8)}`,
                sourceType: 'DOCUMENTATION',
                sourceId: resourceId,
                evidenceType: 'DOCUMENTATION_SECTION_EVIDENCE',
                description: `Documentation section "${safeHeading}" in ${doc.filePath} documents feature "${feature.name}"`,
                strength: 0.7,
                confidence: match.confidence,
                metadata: {
                  filePath: doc.filePath,
                  heading: safeHeading,
                  // Do NOT execute content or store unchecked commands
                },
                timestamp: Date.now(),
              },
            ],
            score: match.confidence,
            confidence: {
              level: scoreToMappingConfidenceLevel(match.confidence),
              score: match.confidence,
              reasons: [match.reason],
            },
            sources: ['DOCUMENTATION'],
            conflicts: [],
            status: 'DETECTED',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  public discoverMappings(context: MappingContext): MappingCandidate[] {
    return [];
  }
}
