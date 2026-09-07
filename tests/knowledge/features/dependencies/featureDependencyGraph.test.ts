import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureDependencyGraph } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyGraph';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';

describe('Feature Dependency Graph: Graph Data Structure & Traversal', () => {
  let graph: FeatureDependencyGraph;

  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featUser = createDefaultFeature('feat_user' as any, 'User Management', scope);
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing & Subscriptions', scope);
  const featNotifications = createDefaultFeature('feat_notif' as any, 'Notifications', scope);
  const featIsolated = createDefaultFeature('feat_isolated' as any, 'Isolated Feature', scope);

  beforeEach(() => {
    graph = new FeatureDependencyGraph();
    graph.addFeature(featAuth);
    graph.addFeature(featUser);
    graph.addFeature(featBilling);
    graph.addFeature(featNotifications);
    graph.addFeature(featIsolated);
  });

  function createRel(
    id: string,
    sourceId: string,
    targetId: string,
    type: any = 'DEPENDS_ON',
    score: number = 0.9,
    direction: any = 'DIRECTED'
  ): FeatureRelationship {
    return {
      relationshipId: id,
      sourceFeatureId: sourceId as any,
      targetFeatureId: targetId as any,
      relationshipType: type,
      direction,
      confidence: { level: 'HIGH', score, reasons: [] },
      score,
      evidence: [
        {
          evidenceId: `ev_${id}`,
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/import.ts',
          evidenceType: 'IMPORT',
          description: `${sourceId} -> ${targetId}`,
          strength: 0.9,
          confidence: score,
          metadata: {},
          timestamp: Date.now(),
        },
      ],
      source: 'DISCOVERED',
      scope,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };
  }

  it('should manage nodes and edges correctly', () => {
    expect(graph.getAllFeatures().length).toBe(5);
    expect(graph.getFeature('feat_auth')?.name).toBe('Authentication');

    const rel1 = createRel('rel_1', 'feat_billing', 'feat_auth');
    graph.addRelationship(rel1);

    expect(graph.size().edges).toBe(1);
    expect(graph.hasRelationship('feat_billing', 'feat_auth')).toBe(true);
    expect(graph.hasRelationship('feat_auth', 'feat_billing')).toBe(false);

    graph.removeRelationship('rel_1');
    expect(graph.size().edges).toBe(0);
    expect(graph.hasRelationship('feat_billing', 'feat_auth')).toBe(false);
  });

  it('should query dependencies and dependents', () => {
    // billing -> auth, auth -> user
    graph.addRelationship(createRel('rel_bill_auth', 'feat_billing', 'feat_auth'));
    graph.addRelationship(createRel('rel_auth_user', 'feat_auth', 'feat_user'));

    const billingDeps = graph.getDependencies('feat_billing');
    expect(billingDeps.map((f) => f.id)).toContain('feat_auth');

    const authDependents = graph.getDependents('feat_auth');
    expect(authDependents.map((f) => f.id)).toContain('feat_billing');

    const authDeps = graph.getDependencies('feat_auth');
    expect(authDeps.map((f) => f.id)).toContain('feat_user');
  });

  it('should find shortest directed path using BFS', () => {
    // billing -> auth -> user
    graph.addRelationship(createRel('rel_1', 'feat_billing', 'feat_auth', 'DEPENDS_ON', 0.9));
    graph.addRelationship(createRel('rel_2', 'feat_auth', 'feat_user', 'DEPENDS_ON', 0.8));

    const path = graph.findPath('feat_billing', 'feat_user');
    expect(path).not.toBeNull();
    expect(path?.nodes).toEqual(['feat_billing', 'feat_auth', 'feat_user']);
    expect(path?.pathLength).toBe(2);
    expect(path?.totalConfidence).toBe(0.72);

    const noPath = graph.findPath('feat_user', 'feat_billing');
    expect(noPath).toBeNull();
  });

  it('should find full dependency chains (upstream and downstream)', () => {
    // billing -> auth -> user
    // notif -> auth
    graph.addRelationship(createRel('rel_1', 'feat_billing', 'feat_auth'));
    graph.addRelationship(createRel('rel_2', 'feat_notif', 'feat_auth'));
    graph.addRelationship(createRel('rel_3', 'feat_auth', 'feat_user'));

    const chain = graph.findDependencyChain('feat_auth');
    expect(chain.upstream.map((f) => f.id).sort()).toEqual(['feat_billing', 'feat_notif']);
    expect(chain.downstream.map((f) => f.id)).toEqual(['feat_user']);
    expect(chain.paths.length).toBe(3);
  });

  it('should detect elementary cycles and classify them correctly', () => {
    // auth -> user -> auth (cycle)
    graph.addRelationship(createRel('rel_au', 'feat_auth', 'feat_user', 'DEPENDS_ON', 0.9));
    graph.addRelationship(createRel('rel_ua', 'feat_user', 'feat_auth', 'DEPENDS_ON', 0.85));

    const cycles = graph.detectCycles();
    expect(cycles.length).toBe(1);
    expect(cycles[0].classification).toBe('ARCHITECTURAL_RISK');
    expect(cycles[0].features.length).toBe(3); // [feat_auth, feat_user, feat_auth]
  });

  it('should identify isolated features and neighbors', () => {
    graph.addRelationship(createRel('rel_1', 'feat_billing', 'feat_auth'));

    const isolated = graph.getIsolatedFeatures();
    expect(isolated.map((f) => f.id)).toContain('feat_isolated');
    expect(isolated.map((f) => f.id)).toContain('feat_user');
    expect(isolated.map((f) => f.id)).not.toContain('feat_billing');
    expect(isolated.map((f) => f.id)).not.toContain('feat_auth');

    const authNeighbors = graph.getNeighbors('feat_auth');
    expect(authNeighbors.map((f) => f.id)).toContain('feat_billing');
  });

  it('should handle bidirectional relationships', () => {
    const bidiRel = createRel('rel_bidi', 'feat_billing', 'feat_auth', 'INTEGRATES_WITH', 0.8, 'BIDIRECTIONAL');
    graph.addRelationship(bidiRel);

    expect(graph.hasRelationship('feat_billing', 'feat_auth')).toBe(true);
    expect(graph.hasRelationship('feat_auth', 'feat_billing')).toBe(true);
    expect(graph.getDependencies('feat_billing').map((f) => f.id)).toContain('feat_auth');
    expect(graph.getDependencies('feat_auth').map((f) => f.id)).toContain('feat_billing');
  });
});
