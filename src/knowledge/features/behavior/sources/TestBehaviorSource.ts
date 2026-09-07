import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class TestBehaviorSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'TEST_BEHAVIOR_SOURCE';
  public readonly sourceType = 'VERIFICATION';
  public readonly priority = 65;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // Check mapped TEST resources
    const testMappings = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'TEST');
    const testArtifacts = context.extraction?.testArtifacts || [];

    for (const test of testMappings) {
      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'TEST_VERIFICATION_EVIDENCE',
        `Automated test covers feature behavior: ${test.resourceId}`,
        0.88,
        { testId: test.resourceId }
      );

      const testNode = BehaviorSourceHelper.createNode(
        test.resourceId,
        'TEST',
        'FUNCTION',
        `Test: ${test.resourceId}`,
        { isTest: true },
        0.88
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Test Verified Behavior: ${test.resourceId}`,
          'PRIMARY',
          [testNode],
          [],
          [ev],
          this.sourceId,
          0.88,
          { testVerified: true }
        )
      );
    }

    for (const ta of testArtifacts) {
      if (ta.featureId === featureId || ta.name?.toLowerCase().includes(context.feature.name.toLowerCase())) {
        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'TEST_ARTIFACT_EXTRACTED',
          `Test artifact ${ta.name} verifies behavior`,
          0.85
        );
        const node = BehaviorSourceHelper.createNode(
          ta.id || ta.name,
          'TEST',
          'FUNCTION',
          `Test Artifact: ${ta.name}`,
          { testArtifact: true },
          0.85
        );
        candidates.push(
          BehaviorSourceHelper.createCandidate(
            featureId,
            `Test Artifact Flow: ${ta.name}`,
            'PRIMARY',
            [node],
            [],
            [ev],
            this.sourceId,
            0.85
          )
        );
      }
    }

    return candidates;
  }
}
