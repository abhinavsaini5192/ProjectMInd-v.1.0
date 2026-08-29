import { describe, it, expect } from 'vitest';
import { createDefaultFeature } from '../../../src/knowledge/features/models/Feature';
import { FeatureType } from '../../../src/knowledge/features/models/FeatureType';
import { FeatureStatus } from '../../../src/knowledge/features/models/FeatureStatus';
import { FeatureOrigin } from '../../../src/knowledge/features/models/FeatureOrigin';
import { FeatureConfidenceLevel } from '../../../src/knowledge/features/models/FeatureConfidence';

describe('Feature Model & Defaults', () => {
  it('should create feature with default values', () => {
    const feature = createDefaultFeature('feat_auth_12345678', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    expect(feature.id).toBe('feat_auth_12345678');
    expect(feature.name).toBe('Authentication');
    expect(feature.type).toBe(FeatureType.UNKNOWN);
    expect(feature.status).toBe(FeatureStatus.DISCOVERED);
    expect(feature.origin).toBe(FeatureOrigin.MANUAL);
    expect(feature.confidence.level).toBe(FeatureConfidenceLevel.UNKNOWN);
    expect(feature.version).toBe(1);
    expect(feature.references).toEqual([]);
    expect(feature.relationships).toEqual([]);
  });

  it('should serialize and deserialize cleanly', () => {
    const feature = createDefaultFeature('feat_payment_123456', 'Payment Processing', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    }, {
      type: FeatureType.USER_FACING,
      status: FeatureStatus.ACTIVE,
      origin: FeatureOrigin.DISCOVERED,
      confidence: { level: FeatureConfidenceLevel.HIGH, score: 0.92 }
    });

    const json = JSON.stringify(feature);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe(feature.id);
    expect(parsed.confidence.score).toBe(0.92);
    expect(parsed.type).toBe(FeatureType.USER_FACING);
  });
});
