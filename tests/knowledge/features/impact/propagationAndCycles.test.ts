import { describe, it, expect } from 'vitest';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import { DependencyImpactPropagator } from '../../../../src/knowledge/features/impact/propagation/DependencyImpactPropagator.js';
import { MappingImpactSource } from '../../../../src/knowledge/features/impact/sources/MappingImpactSource.js';

describe('Phase 6.7 - Propagation & Cycle Handling', () => {
  it('should propagate multi-hop impacts with accurate distance tracking', async () => {
    // Auth -> Checkout -> OrderProcessing
    const mapAuth = ImpactTestHelper.createMapping('feat_auth', 'AuthService.login', 'SYMBOL');
    const rel1 = ImpactTestHelper.createRelationship('feat_checkout', 'feat_auth', 'DEPENDS_ON');
    const rel2 = ImpactTestHelper.createRelationship('feat_order', 'feat_checkout', 'DEPENDS_ON');

    const change = ImpactTestHelper.createChange('AuthService.login', 'SYMBOL');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapAuth],
      relationships: [rel1, rel2],
    });

    const mappingSource = new MappingImpactSource();
    const initialCandidates = await mappingSource.detectImpacts(context);

    const propagator = new DependencyImpactPropagator();
    const result = await propagator.propagate(initialCandidates, context, { maxDepth: 5 });

    // feat_checkout should be distance 1
    const checkoutCand = result.propagatedCandidates.find((c) => c.targetFeatureId === 'feat_checkout');
    expect(checkoutCand).toBeDefined();
    expect(checkoutCand!.distance).toBe(1);

    // feat_order should be distance 2
    const orderCand = result.propagatedCandidates.find((c) => c.targetFeatureId === 'feat_order');
    expect(orderCand).toBeDefined();
    expect(orderCand!.distance).toBe(2);

    // Verify paths generated
    expect(result.generatedPaths.length).toBeGreaterThanOrEqual(2);
    const orderPath = result.generatedPaths.find((p) => p.targetNode.featureId === 'feat_order');
    expect(orderPath).toBeDefined();
    expect(orderPath!.distance).toBe(2);
    expect(orderPath!.nodes.map((n) => n.featureId)).toEqual(['feat_auth', 'feat_checkout', 'feat_order']);
  });

  it('should handle circular dependencies without infinite loops or crashing (Section 34)', async () => {
    // A -> B -> C -> A
    const mapA = ImpactTestHelper.createMapping('feat_a', 'ResourceA', 'FILE');
    const relAB = ImpactTestHelper.createRelationship('feat_b', 'feat_a', 'DEPENDS_ON');
    const relBC = ImpactTestHelper.createRelationship('feat_c', 'feat_b', 'DEPENDS_ON');
    const relCA = ImpactTestHelper.createRelationship('feat_a', 'feat_c', 'DEPENDS_ON');

    const change = ImpactTestHelper.createChange('ResourceA', 'FILE');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapA],
      relationships: [relAB, relBC, relCA],
    });

    const mappingSource = new MappingImpactSource();
    const initialCandidates = await mappingSource.detectImpacts(context);

    const propagator = new DependencyImpactPropagator();
    const result = await propagator.propagate(initialCandidates, context, { maxDepth: 10 });

    // Should terminate safely
    expect(result.cyclesDetected.length).toBeGreaterThan(0);
    expect(result.cyclesDetected[0]!.description).toContain('Cycle detected');

    // No infinite candidates generated
    expect(result.propagatedCandidates.length).toBeLessThanOrEqual(6);
  });

  it('should enforce configurable maxDepth limit', async () => {
    // Chain of 5 hops
    const rel1 = ImpactTestHelper.createRelationship('feat_b', 'feat_a', 'DEPENDS_ON');
    const rel2 = ImpactTestHelper.createRelationship('feat_c', 'feat_b', 'DEPENDS_ON');
    const rel3 = ImpactTestHelper.createRelationship('feat_d', 'feat_c', 'DEPENDS_ON');
    const rel4 = ImpactTestHelper.createRelationship('feat_e', 'feat_d', 'DEPENDS_ON');

    const mapA = ImpactTestHelper.createMapping('feat_a', 'ResourceA', 'FILE');
    const change = ImpactTestHelper.createChange('ResourceA', 'FILE');
    const context = ImpactTestHelper.createContext({
      changes: [change],
      mappings: [mapA],
      relationships: [rel1, rel2, rel3, rel4],
    });

    const mappingSource = new MappingImpactSource();
    const initialCandidates = await mappingSource.detectImpacts(context);

    const propagator = new DependencyImpactPropagator();
    // Max depth 2
    const result = await propagator.propagate(initialCandidates, context, { maxDepth: 2 });

    expect(result.maxDepthReached).toBeLessThanOrEqual(2);
    // feat_b (d=1) and feat_c (d=2) should be present, but feat_d (d=3) must be skipped
    expect(result.propagatedCandidates.some((c) => c.targetFeatureId === 'feat_b')).toBe(true);
    expect(result.propagatedCandidates.some((c) => c.targetFeatureId === 'feat_c')).toBe(true);
    expect(result.propagatedCandidates.some((c) => c.targetFeatureId === 'feat_d')).toBe(false);
  });
});
