import { describe, it, expect } from 'vitest';
import { FeatureValidator } from '../../../src/knowledge/features/core/FeatureValidator';
import { createDefaultFeature } from '../../../src/knowledge/features/models/Feature';
import { InvalidFeatureError } from '../../../src/knowledge/features/errors/InvalidFeatureError';

describe('Feature Validation', () => {
  const validator = new FeatureValidator();

  it('should validate complete valid features', () => {
    const feat = createDefaultFeature('feat_dashboard_1234', 'Analytics Dashboard', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    const result = validator.validate(feat);
    expect(result.valid).toBe(true);
  });

  it('should throw InvalidFeatureError for empty names or malformed IDs', () => {
    const invalidFeat = createDefaultFeature('invalid_id', '', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    expect(() => validator.validate(invalidFeat)).toThrow(InvalidFeatureError);
  });
});
