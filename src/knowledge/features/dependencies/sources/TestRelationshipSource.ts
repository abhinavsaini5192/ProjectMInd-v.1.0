import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type {
  IFeatureRelationshipSource,
  DependencyContext,
} from '../interfaces/IFeatureRelationshipSource';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';
import { DependencySourceHelper } from './DependencySourceHelper';

export class TestRelationshipSource implements IFeatureRelationshipSource {
  public readonly sourceType = 'TEST';
  public readonly name = 'TestRelationshipSource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'VERIFIES' || relationshipType === 'ASSOCIATED_WITH';
  }

  public discoverRelationships(
    feature: Feature,
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates = this.discoverCandidates(allFeatures, context);
    return candidates.filter((c) => c.sourceFeatureId === feature.id);
  }

  public discoverCandidates(
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates: FeatureRelationshipCandidate[] = [];
    if (!context.tests || context.tests.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const test of context.tests) {
      const testPath = test.filePath;
      const testSuite = test.suiteName || '';
      const targets = [
        ...((test as any).targetSymbols || []),
        ...((test as any).targetResources || []),
      ];

      // Check which features this test mentions or maps to
      const matchedFeatures = new Set<string>();

      const fileFeats = DependencySourceHelper.getFeaturesForResource(testPath, resourceMap);
      for (const f of fileFeats) matchedFeatures.add(f);

      for (const target of targets) {
        const targetFeats = DependencySourceHelper.getFeaturesForResource(target, resourceMap);
        for (const f of targetFeats) matchedFeatures.add(f);
      }

      const testContent = `${testPath} ${testSuite} ${(test as any).testName || ''} ${(test.testCases || []).join(' ')} ${targets.join(' ')}`.toLowerCase();
      for (const f of allFeatures) {
        const nameLower = f.name.toLowerCase();
        const token = nameLower.split(/\s+/)[0] || '';
        const idLower = f.id.toLowerCase().replace('feat_', '');

        if (
          testContent.includes(nameLower) ||
          (token.length > 2 && testContent.includes(token)) ||
          (idLower.length > 2 && testContent.includes(idLower)) ||
          (token.length > 4 && testContent.includes(token.slice(0, 4)))
        ) {
          matchedFeatures.add(f.id);
        }
      }

      if (matchedFeatures.size < 2) continue;

      const featureIds = Array.from(matchedFeatures);
      for (let i = 0; i < featureIds.length; i++) {
        for (let j = i + 1; j < featureIds.length; j++) {
          let featA = featureIds[i]!;
          let featB = featureIds[j]!;

          // If featB is the owner of the test file and featA is not, orient featB -> featA
          if (!fileFeats.includes(featA) && fileFeats.includes(featB)) {
            const tmp = featA;
            featA = featB;
            featB = tmp;
          }

          const pairKey = `${featA}:::${featB}:::TEST:::${testPath}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const candidate: FeatureRelationshipCandidate = {
            candidateId: `cand_test_${randomUUID().slice(0, 8)}`,
            sourceFeatureId: featA,
            targetFeatureId: featB,
            proposedType: 'VERIFIES',
            direction: 'UNDIRECTED',
            evidence: [
              {
                evidenceId: `ev_test_${randomUUID().slice(0, 8)}`,
                sourceType: 'TEST',
                sourceId: testPath,
                evidenceType: 'CROSS_FEATURE_TEST_VERIFICATION',
                description: `Test suite "${testSuite || testPath}" exercises and verifies both "${featA}" and "${featB}"`,
                strength: 0.50,
                confidence: 0.50,
                metadata: {
                  testFilePath: testPath,
                  suiteName: testSuite,
                },
                timestamp: Date.now(),
              },
            ],
            score: 0.50,
            confidence: {
              level: scoreToFeatureRelationshipConfidenceLevel(0.50),
              score: 0.50,
              reasons: [`Cross-feature test verification in ${testPath}`],
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
    }

    return candidates;
  }
}
