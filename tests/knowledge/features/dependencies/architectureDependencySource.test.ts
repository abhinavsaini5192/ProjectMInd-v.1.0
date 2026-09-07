import { describe, it, expect } from 'vitest';
import { ArchitectureDependencySource } from '../../../../src/knowledge/features/dependencies/sources/ArchitectureDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: ArchitectureDependencySource', () => {
  const source = new ArchitectureDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featInfra = createDefaultFeature('feat_infra' as any, 'Infrastructure Platform', scope);
  const featApp = createDefaultFeature('feat_app' as any, 'Checkout Flow', scope);
  const allFeatures = [featInfra, featApp];

  it('should detect PROVIDES relationship when platform layer provides foundation for application layer', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      architectureCapabilities: [
        {
          layer: 'PLATFORM',
          featureId: 'feat_infra',
          capabilityType: 'DATABASE_OR_MESSAGE_BUS',
        },
        {
          layer: 'APPLICATION',
          featureId: 'feat_app',
          capabilityType: 'BUSINESS_LOGIC',
        },
      ],
    };

    const candidates = source.discoverRelationships(featInfra, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_infra');
    expect(candidates[0].targetFeatureId).toBe('feat_app');
    expect(candidates[0].proposedType).toBe('PROVIDES');
  });
});
