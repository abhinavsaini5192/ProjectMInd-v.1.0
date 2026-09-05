import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';

export class TestFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'TEST';
  public readonly name = 'TestFeatureSource';

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.tests || context.tests.length === 0) {
      return evidenceList;
    }

    for (const test of context.tests) {
      const capability =
        CapabilityNameInferer.infer(test.filePath) ||
        (test.suiteName ? CapabilityNameInferer.infer(test.suiteName) : null);

      if (!capability) continue;

      evidenceList.push({
        evidenceId: `ev_test_${randomUUID().slice(0, 8)}`,
        sourceType: 'TEST',
        sourceId: test.filePath,
        evidenceType: 'TEST_SUITE',
        description: `Test suite for ${capability} in ${test.filePath}${test.suiteName ? ` (${test.suiteName})` : ''}`,
        targetCapability: capability,
        strength: 'STRONG',
        confidence: 0.88,
        resourceReference: {
          referenceId: `ref_test_${randomUUID().slice(0, 8)}`,
          resourceType: 'TEST',
          resourceId: test.filePath,
          role: 'VERIFICATION',
          confidence: 0.88,
        },
        timestamp: Date.now(),
        metadata: {
          filePath: test.filePath,
          suiteName: test.suiteName,
          testCasesCount: test.testCases?.length || 0,
        },
      });
    }

    return evidenceList;
  }
}
