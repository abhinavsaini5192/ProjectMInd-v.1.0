import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureHealthRepository } from '../../../../src/knowledge/features/health/repository/FeatureHealthRepository.js';
import { FeatureHealthCoordinator } from '../../../../src/knowledge/features/health/core/FeatureHealthCoordinator.js';
import { FeatureHealthEngine } from '../../../../src/knowledge/features/health/core/FeatureHealthEngine.js';

describe('Phase 6.6 Incremental Health Analysis', () => {
  it('analyzes incremental changes and propagates to affected features', async () => {
    const repository = new FeatureHealthRepository();
    const featA = HealthTestHelper.createFeature('feat_a', 'Feature A');
    const featB = HealthTestHelper.createFeature('feat_b', 'Feature B');
    const dep = HealthTestHelper.createDependency('feat_a', 'feat_b', 0.8);

    // Mock coordinator that resolves contexts for feat_a and feat_b
    const coordinator: any = {
      buildContext: async (id: string) => {
        if (id === 'feat_a') {
          return HealthTestHelper.createContext({ feature: featA, dependencies: [dep] });
        }
        return HealthTestHelper.createContext({ feature: featB, dependents: [dep] });
      },
      buildAllContexts: async () => [
        HealthTestHelper.createContext({ feature: featA, dependencies: [dep] }),
        HealthTestHelper.createContext({ feature: featB, dependents: [dep] })
      ]
    };

    const engine = new FeatureHealthEngine(repository, { coordinator });

    // Initial full run
    const fullResult = await engine.analyze({
      workspaceId: 'ws_test',
      repositoryId: 'repo_test',
      mode: 'FULL'
    });

    expect(fullResult.featuresAnalyzed).toBe(2);
    expect(fullResult.failures.length).toBe(0);

    // Incremental run touching feat_b should analyze feat_b and dependent feat_a
    const incResult = await engine.analyzeIncremental(['feat_b']);
    expect(incResult.analysisMode).toBe('INCREMENTAL');
    expect(incResult.featuresAnalyzed).toBe(2);
    expect(incResult.staleFeatures).toContain('feat_b');
  });
});
