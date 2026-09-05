import { describe, it, expect } from 'vitest';
import { TestMappingSource } from '../../../../src/knowledge/features/mapping/sources/TestMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: TestMappingSource', () => {
  const source = new TestMappingSource();

  it('should map test suites to feature with VERIFICATION role and TEST resource type', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      tests: [
        {
          filePath: 'tests/auth/authService.test.ts',
          suiteName: 'Authentication Service Suite',
          testCases: ['should authenticate user with valid credentials', 'should reject invalid password'],
        },
        {
          filePath: 'tests/billing/payment.test.ts',
          suiteName: 'Payment Gateway Suite',
          testCases: ['should charge credit card'],
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(1);
    const testCand = candidates[0]!;
    expect(testCand.resourceId).toBe('tests/auth/authService.test.ts');
    expect(testCand.resourceType).toBe('TEST');
    expect(testCand.proposedRole).toBe('VERIFICATION');
    expect(testCand.evidence[0]!.evidenceType).toBe('FEATURE_TEST_VERIFICATION');
    expect(testCand.evidence[0]!.metadata?.testCases).toContain('should authenticate user with valid credentials');
  });

  it('should return empty list when no tests match the feature', () => {
    const feature = createDefaultFeature('feat_analytics', 'Analytics', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      tests: [
        {
          filePath: 'tests/auth/login.test.ts',
          suiteName: 'Login Tests',
        },
      ],
    };

    const candidates = source.mapFeature(feature, context);
    expect(candidates).toEqual([]);
  });
});
