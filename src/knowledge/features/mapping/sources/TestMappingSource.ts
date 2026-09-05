import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class TestMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'TEST';
  public readonly name = 'TestMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'TEST';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.tests) return candidates;

    for (const test of context.tests) {
      const match = MappingMatcher.matchesFeature(feature, test.suiteName || test.filePath);

      if (match.matches) {
        const candidate: MappingCandidate = {
          candidateId: `cand_test_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: test.filePath,
          resourceType: 'TEST',
          proposedRole: 'VERIFICATION',
          evidence: [
            {
              evidenceId: `ev_test_${randomUUID().slice(0, 8)}`,
              sourceType: 'TEST',
              sourceId: test.filePath,
              evidenceType: 'FEATURE_TEST_VERIFICATION',
              description: `Test suite "${test.suiteName || test.filePath}" verifies behavior of feature "${feature.name}"`,
              strength: 0.88,
              confidence: match.confidence,
              metadata: {
                suiteName: test.suiteName,
                filePath: test.filePath,
                testCases: test.testCases,
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
          sources: ['TEST'],
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
