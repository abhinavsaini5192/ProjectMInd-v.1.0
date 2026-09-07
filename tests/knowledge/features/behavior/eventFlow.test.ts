import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Asynchronous Event Flow Preservation', () => {
  it('should identify event emission and queue hops preserving asynchronous boundary', async () => {
    const orderFeature = BehaviorTestHelper.createFeature('feat_order_fulfillment', 'Order Fulfillment');

    const mappings = [
      BehaviorTestHelper.createMapping('feat_order_fulfillment', 'OrderService.create', 'SYMBOL', 'SERVICE'),
      BehaviorTestHelper.createMapping('feat_order_fulfillment', 'OrderCreatedEvent', 'SYMBOL', 'PRIMARY', {
        isEvent: true,
      }),
      BehaviorTestHelper.createMapping('feat_order_fulfillment', 'OrderQueueWorker', 'SYMBOL', 'HANDLER'),
    ];

    const context = BehaviorTestHelper.createContext(orderFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_order_fulfillment', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    // Find the event flow
    const eventFlow = behavior.flows.find(f => f.flowType === 'EVENT');
    expect(eventFlow).toBeDefined();

    // Verify event node exists
    const eventNode = eventFlow?.nodes.find(n => n.stepType === 'EVENT' || n.stepType === 'QUEUE');
    expect(eventNode).toBeDefined();
    expect(eventNode?.metadata?.asynchronous).toBe(true);

    // Verify async edge exists
    const asyncEdge = eventFlow?.edges.find(e => e.asynchronous === true);
    expect(asyncEdge).toBeDefined();
    expect(asyncEdge?.relationType).toBe('TRIGGERS');
  });
});
