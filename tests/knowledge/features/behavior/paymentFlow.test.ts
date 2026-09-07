import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Payment Flow with External Integration', () => {
  it('should identify external third-party SDK and database persistence in payment flow', async () => {
    const paymentFeature = BehaviorTestHelper.createFeature('feat_payment_processing', 'Payment Processing');

    const mappings = [
      BehaviorTestHelper.createMapping('feat_payment_processing', 'POST /api/payment/charge', 'ENDPOINT', 'PRIMARY', {
        method: 'POST',
        path: '/api/payment/charge',
      }),
      BehaviorTestHelper.createMapping('feat_payment_processing', 'PaymentController.charge', 'SYMBOL', 'CONTROLLER', {
        role: 'CONTROLLER',
      }),
      BehaviorTestHelper.createMapping('feat_payment_processing', 'PaymentService.charge', 'SYMBOL', 'SERVICE', {
        role: 'SERVICE',
      }),
      BehaviorTestHelper.createMapping('feat_payment_processing', 'stripe', 'DEPENDENCY', 'PRIMARY', {
        provider: 'stripe',
      }),
      BehaviorTestHelper.createMapping('feat_payment_processing', 'PaymentRecord', 'DATABASE_ENTITY', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_payment_processing', 'payment.spec.ts', 'TEST', 'PRIMARY'),
    ];

    const context = BehaviorTestHelper.createContext(paymentFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_payment_processing', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    const primaryFlow = behavior.primaryFlows[0];
    expect(primaryFlow).toBeDefined();

    // Verify external service step is identified
    const externalNode = primaryFlow.nodes.find(n => n.stepType === 'EXTERNAL_SERVICE');
    expect(externalNode).toBeDefined();
    expect(externalNode?.metadata?.externalService).toBe(true);

    // Verify database step is identified
    const dbNode = primaryFlow.nodes.find(n => n.stepType === 'DATABASE');
    expect(dbNode).toBeDefined();

    // Verify confidence is calibrated high
    expect(behavior.confidence.score).toBeGreaterThanOrEqual(0.85);
  });
});
