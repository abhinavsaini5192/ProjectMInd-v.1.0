import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class CommandMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'COMMAND';
  public readonly name = 'CommandMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'COMMAND';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.commands) return candidates;

    for (const cmd of context.commands) {
      const match = MappingMatcher.matchesFeature(feature, cmd.name || cmd.signature || '');

      if (match.matches) {
        const candidate: MappingCandidate = {
          candidateId: `cand_cmd_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: cmd.commandId || cmd.name,
          resourceType: 'COMMAND',
          proposedRole: 'COMMAND',
          evidence: [
            {
              evidenceId: `ev_cmd_${randomUUID().slice(0, 8)}`,
              sourceType: 'COMMAND',
              sourceId: cmd.commandId || cmd.name,
              evidenceType: 'CLI_OR_APP_COMMAND',
              description: `Command "${cmd.name}" (${cmd.signature || ''}) triggers feature "${feature.name}"`,
              strength: 0.8,
              confidence: match.confidence,
              metadata: {
                name: cmd.name,
                signature: cmd.signature,
                filePath: cmd.filePath,
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
          sources: ['COMMAND'],
          conflicts: [],
          status: 'DETECTED',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  public discoverMappings(context: MappingContext): MappingCandidate[] {
    return [];
  }
}
