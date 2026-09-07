import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Multi-Flow Coexistence Under a Single Feature', () => {
  it('should maintain distinct, separate flows for password login, oauth, token refresh, and logout', async () => {
    const authFeature = BehaviorTestHelper.createFeature('feat_auth_multi', 'Authentication');

    const mappings = [
      // Flow 1: Password Login
      BehaviorTestHelper.createMapping('feat_auth_multi', 'POST /api/auth/login', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/auth/login',
      }),
      // Flow 2: OAuth Login
      BehaviorTestHelper.createMapping('feat_auth_multi', 'POST /api/auth/oauth', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/auth/oauth',
      }),
      // Flow 3: Token Refresh
      BehaviorTestHelper.createMapping('feat_auth_multi', 'POST /api/auth/refresh', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/auth/refresh',
      }),
      // Flow 4: Logout
      BehaviorTestHelper.createMapping('feat_auth_multi', 'POST /api/auth/logout', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/auth/logout',
      }),
      BehaviorTestHelper.createMapping('feat_auth_multi', 'AuthController', 'SYMBOL', 'CONTROLLER'),
      BehaviorTestHelper.createMapping('feat_auth_multi', 'AuthService', 'SYMBOL', 'SERVICE'),
    ];

    const context = BehaviorTestHelper.createContext(authFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_auth_multi', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    // Verify 4 distinct entry points exist
    expect(behavior.entryPoints.length).toBe(4);

    // Verify separate flows exist for each route
    const flowRoutes = behavior.flows
      .map(f => f.nodes.find(n => n.stepType === 'ENTRY_POINT')?.metadata?.route)
      .filter(Boolean);

    expect(flowRoutes).toContain('/api/auth/login');
    expect(flowRoutes).toContain('/api/auth/oauth');
    expect(flowRoutes).toContain('/api/auth/refresh');
    expect(flowRoutes).toContain('/api/auth/logout');
  });
});
