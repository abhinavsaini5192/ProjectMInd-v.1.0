import { describe, it, expect } from 'vitest';
import { FeatureDiscoveryCoordinator } from '../../../../src/knowledge/features/discovery/core/FeatureDiscoveryCoordinator';
import type { DiscoveryContext } from '../../../../src/knowledge/features/discovery/models/DiscoverySource';

describe('Feature Discovery: Cross-Evidence Convergence', () => {
  it('should converge endpoints, symbols, tests, config, and dependencies into a single cohesive candidate', async () => {
    const coordinator = new FeatureDiscoveryCoordinator();

    const context: DiscoveryContext = {
      workspaceId: 'ws-test',
      repositoryId: 'repo-test',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          handlerSymbolId: 'AuthController.login',
          filePath: 'src/auth/AuthController.ts',
        },
        {
          method: 'POST',
          path: '/api/v1/auth/logout',
          handlerSymbolId: 'AuthController.logout',
          filePath: 'src/auth/AuthController.ts',
        },
      ],
      symbols: [
        {
          id: 'sym_auth_ctrl',
          name: 'AuthController',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthController.ts',
          exported: true,
        },
        {
          id: 'sym_auth_srv',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
          exported: true,
        },
      ],
      tests: [
        {
          suiteName: 'AuthSuite',
          filePath: 'tests/auth/auth.test.ts',
          testCases: ['login test'],
        },
      ],
      configurations: [
        {
          key: 'JWT_SECRET',
          filePath: '.env.example',
          category: 'auth',
        },
      ],
      dependencies: [
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'jsonwebtoken',
          type: 'import',
        },
      ],
      documentation: [
        {
          filePath: 'docs/authentication.md',
          title: 'Authentication Guide',
          sections: [
            { heading: 'Authentication Guide', content: 'This document explains the authentication workflow using JWT tokens.' },
          ],
        },
      ],
    };

    const { candidates } = await coordinator.coordinate(context);

    // Candidates should converge to Authentication
    const authCandidate = candidates.find((c) => c.proposedName === 'Authentication');
    expect(authCandidate).toBeDefined();

    // Verify cross-source convergence: evidence from multiple distinct source types
    expect(authCandidate?.sources).toContain('ENDPOINT');
    expect(authCandidate?.sources).toContain('SYMBOL');
    expect(authCandidate?.sources).toContain('TEST');
    expect(authCandidate?.sources).toContain('CONFIGURATION');
    expect(authCandidate?.sources).toContain('DEPENDENCY');
    expect(authCandidate?.sources).toContain('DOCUMENTATION');

    // Evidence count should reflect all converged items
    expect(authCandidate?.evidence.length).toBeGreaterThanOrEqual(6);

    // References should include endpoints, symbols, and tests
    expect(authCandidate?.references.length).toBeGreaterThanOrEqual(3);

    // Confidence should be HIGH or VERY_HIGH
    expect(authCandidate?.confidence.level).toMatch(/HIGH|VERY_HIGH/);
    expect(authCandidate?.score).toBeGreaterThanOrEqual(0.70);
  });
});
