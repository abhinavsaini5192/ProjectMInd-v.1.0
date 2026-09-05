import { describe, it, expect } from 'vitest';
import { FeatureDiscoveryEngine } from '../../../../src/knowledge/features/discovery/core/FeatureDiscoveryEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import type { DiscoveryContext } from '../../../../src/knowledge/features/discovery/models/DiscoverySource';

describe('Feature Discovery: Synthetic Repository End-to-End', () => {
  it('should discover Authentication, Payment Processing, and User Management from realistic repository signals', async () => {
    const registry = new FeatureRegistry();
    const engine = new FeatureDiscoveryEngine(registry);

    const syntheticRepoContext: DiscoveryContext = {
      workspaceId: 'ws_synth_01',
      repositoryId: 'repo_synth_01',
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
        {
          method: 'POST',
          path: '/api/v1/payments/charge',
          handlerSymbolId: 'PaymentController.charge',
          filePath: 'src/payments/PaymentController.ts',
        },
        {
          method: 'GET',
          path: '/api/v1/users/profile',
          handlerSymbolId: 'UserController.getProfile',
          filePath: 'src/users/UserController.ts',
        },
      ],
      modules: [
        {
          id: 'mod_auth',
          name: 'auth',
          path: 'src/auth',
          exports: ['AuthController', 'AuthService', 'TokenManager'],
        },
        {
          id: 'mod_payments',
          name: 'payments',
          path: 'src/payments',
          exports: ['PaymentController', 'StripeGateway', 'InvoiceGenerator'],
        },
        {
          id: 'mod_users',
          name: 'users',
          path: 'src/users',
          exports: ['UserController', 'UserService', 'UserProfileRepository'],
        },
      ],
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
          exported: true,
        },
        {
          id: 'sym_stripe_gw',
          name: 'StripeGateway',
          kind: 'ClassDeclaration',
          filePath: 'src/payments/StripeGateway.ts',
          exported: true,
        },
        {
          id: 'sym_user_svc',
          name: 'UserService',
          kind: 'ClassDeclaration',
          filePath: 'src/users/UserService.ts',
          exported: true,
        },
      ],
      tests: [
        {
          suiteName: 'AuthSuite',
          filePath: 'tests/auth/auth.test.ts',
          testCases: ['login test', 'logout test'],
        },
        {
          suiteName: 'PaymentSuite',
          filePath: 'tests/payments/stripe.test.ts',
          testCases: ['charge test'],
        },
        {
          suiteName: 'UserSuite',
          filePath: 'tests/users/users.test.ts',
          testCases: ['get profile test'],
        },
      ],
      configurations: [
        {
          key: 'JWT_SECRET_KEY',
          filePath: '.env.example',
          category: 'auth',
        },
        {
          key: 'STRIPE_API_KEY',
          filePath: '.env.example',
          category: 'payment',
        },
      ],
      dependencies: [
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'jsonwebtoken',
          type: 'import',
        },
        {
          sourceId: 'src/payments/StripeGateway.ts',
          targetId: 'stripe',
          type: 'import',
        },
      ],
      documentation: [
        {
          filePath: 'docs/auth.md',
          title: 'Authentication & Session Guide',
          sections: [
            { heading: 'Login Flow', content: 'User submits credentials...' },
          ],
        },
        {
          filePath: 'docs/payments.md',
          title: 'Payment Integration',
          sections: [
            { heading: 'Stripe Checkout', content: 'Handling credit card charges...' },
          ],
        },
      ],
      history: [
        {
          commitHash: 'c1a2b3c',
          message: 'feat(auth): implement token refresh rotation',
          changedFiles: ['src/auth/TokenManager.ts'],
          timestamp: Date.now() - 100000,
        },
        {
          commitHash: 'd4e5f6a',
          message: 'feat(payments): add 3D secure verification to StripeGateway',
          changedFiles: ['src/payments/StripeGateway.ts'],
          timestamp: Date.now() - 50000,
        },
      ],
    };

    const discoveryResult = await engine.discoverFeatures(syntheticRepoContext);

    expect(discoveryResult.runId).toBeDefined();
    expect(discoveryResult.statistics.candidateCount).toBeGreaterThanOrEqual(3);
    expect(discoveryResult.statistics.evidenceCount).toBeGreaterThanOrEqual(10);

    const candidateNames = discoveryResult.candidates.map((c) => c.proposedName);
    expect(candidateNames).toContain('Authentication');
    expect(candidateNames).toContain('Payment Processing');
    expect(candidateNames).toContain('User Management');

    // Verify auto-promotion into FeatureRegistry
    const allPromoted = registry.getAll();
    const promotedNames = allPromoted.map((f) => f.name);
    expect(promotedNames).toContain('Authentication');
    expect(promotedNames).toContain('Payment Processing');
    expect(promotedNames).toContain('User Management');

    // Verify each promoted feature has rich references
    const authFeature = registry.getByName('Authentication');
    expect(authFeature.references.length).toBeGreaterThanOrEqual(3);
  });
});
