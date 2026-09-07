import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Authentication Flow Reconstitution', () => {
  it('should reconstruct complete authentication flow from entry to database and response', async () => {
    const authFeature = BehaviorTestHelper.createFeature('feat_authentication', 'Authentication');

    const mappings = [
      BehaviorTestHelper.createMapping('feat_authentication', 'POST /api/auth/login', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/auth/login',
      }),
      BehaviorTestHelper.createMapping('feat_authentication', 'AuthController.login', 'SYMBOL', 'CONTROLLER', {
        role: 'CONTROLLER',
      }),
      BehaviorTestHelper.createMapping('feat_authentication', 'LoginSchema.validate', 'SYMBOL', 'VALIDATOR', {
        role: 'VALIDATOR',
      }),
      BehaviorTestHelper.createMapping('feat_authentication', 'AuthService.login', 'SYMBOL', 'SERVICE', {
        role: 'SERVICE',
      }),
      BehaviorTestHelper.createMapping('feat_authentication', 'UserRepository.findByEmail', 'SYMBOL', 'REPOSITORY', {
        role: 'REPOSITORY',
      }),
      BehaviorTestHelper.createMapping('feat_authentication', 'UserEntity', 'DATABASE_ENTITY', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_authentication', 'TokenService.generate', 'SYMBOL', 'SERVICE'),
      BehaviorTestHelper.createMapping('feat_authentication', 'auth.test.ts', 'TEST', 'PRIMARY'),
    ];

    const context = BehaviorTestHelper.createContext(authFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_authentication', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    expect(behavior.featureId).toBe('feat_authentication');
    expect(behavior.flows.length).toBeGreaterThan(0);
    expect(behavior.primaryFlows.length).toBeGreaterThan(0);
    expect(behavior.failureFlows.length).toBeGreaterThan(0);

    // Verify primary flow execution sequence
    const primaryFlow = behavior.primaryFlows[0];
    expect(primaryFlow.flowType).toBe('API');

    const stepTypes = primaryFlow.nodes.map(n => n.stepType);
    expect(stepTypes).toContain('ENTRY_POINT');
    expect(stepTypes).toContain('CONTROLLER');
    expect(stepTypes).toContain('SERVICE');

    // Verify response node is present
    const responseNode = primaryFlow.nodes.find(n => n.stepType === 'RESPONSE');
    expect(responseNode).toBeDefined();

    // Verify failure flows exist for invalid inputs or errors
    const failureFlow = behavior.failureFlows[0];
    expect(failureFlow.flowType).toBe('FAILURE');
    expect(failureFlow.nodes.some(n => n.stepType === 'ERROR_HANDLER')).toBe(true);

    // Verify confidence is high due to test corroboration
    expect(behavior.confidence.score).toBeGreaterThanOrEqual(0.85);
  });
});
