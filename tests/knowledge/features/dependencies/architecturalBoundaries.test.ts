import { describe, it, expect } from 'vitest';
import { FeatureRelationshipValidator } from '../../../../src/knowledge/features/dependencies/core/FeatureRelationshipValidator';
import { DIContainer } from '../../../../src/workspace/di/DIContainer';
import {
  registerFeatureDependencyServices,
  FeatureDependencyTokens,
} from '../../../../src/knowledge/features/dependencies/di/DependencyDISetup';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationshipCandidate } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipCandidate';

describe('Feature Dependency Graph: Architectural Boundaries & DI', () => {
  const validator = new FeatureRelationshipValidator();

  it('should enforce repository boundary by rejecting cross-repository candidate dependencies', () => {
    const featRepo1 = createDefaultFeature('f1' as any, 'Service 1', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-backend',
    });
    const featRepo2 = createDefaultFeature('f2' as any, 'Service 2', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-frontend',
    });

    const featureMap = new Map([
      ['f1', featRepo1],
      ['f2', featRepo2],
    ]);

    const candidate: FeatureRelationshipCandidate = {
      candidateId: 'c_cross_repo',
      sourceFeatureId: 'f1',
      targetFeatureId: 'f2',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/import.ts',
          evidenceType: 'IMPORT',
          description: 'Cross repo import attempt',
          strength: 0.9,
          confidence: 0.9,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.9,
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const val = validator.validateCandidate(candidate, featureMap, 'repo-backend');
    expect(val.valid).toBe(false);
    expect(val.issues.some((i) => i.includes('Cross-repository dependency invalid'))).toBe(true);
  });

  it('should properly register and resolve all dependency services in DIContainer', () => {
    const container = new DIContainer();
    const registry = new FeatureRegistry();

    registerFeatureDependencyServices(container, registry);

    const repository = container.resolve(FeatureDependencyTokens.Repository);
    const graph = container.resolve(FeatureDependencyTokens.Graph);
    const engine = container.resolve(FeatureDependencyTokens.Engine);
    const api = container.resolve(FeatureDependencyTokens.API);

    expect(repository).toBeDefined();
    expect(graph).toBeDefined();
    expect(engine).toBeDefined();
    expect(api).toBeDefined();
  });
});
