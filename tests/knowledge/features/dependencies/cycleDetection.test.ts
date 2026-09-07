import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureDependencyGraph } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyGraph';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';

describe('Feature Dependency Graph: Cycle Detection & Classification', () => {
  let graph: FeatureDependencyGraph;
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featA = createDefaultFeature('feat_a' as any, 'Service A', scope);
  const featB = createDefaultFeature('feat_b' as any, 'Service B', scope);
  const featC = createDefaultFeature('feat_c' as any, 'Service C', scope);

  beforeEach(() => {
    graph = new FeatureDependencyGraph();
    graph.addFeature(featA);
    graph.addFeature(featB);
    graph.addFeature(featC);
  });

  function makeRel(id: string, s: string, t: string, type: any = 'DEPENDS_ON', score = 0.9): FeatureRelationship {
    return {
      relationshipId: id,
      sourceFeatureId: s as any,
      targetFeatureId: t as any,
      relationshipType: type,
      direction: 'DIRECTED',
      confidence: { level: 'HIGH', score, reasons: [] },
      score,
      evidence: [
        {
          evidenceId: `ev_${id}`,
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/file.ts',
          evidenceType: 'IMPORT',
          description: `${s} calls ${t}`,
          strength: score,
          confidence: score,
          metadata: {},
          timestamp: 0,
        },
      ],
      source: 'DISCOVERED',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };
  }

  it('should detect a 3-node cycle: A -> B -> C -> A', () => {
    graph.addRelationship(makeRel('rel_ab', 'feat_a', 'feat_b'));
    graph.addRelationship(makeRel('rel_bc', 'feat_b', 'feat_c'));
    graph.addRelationship(makeRel('rel_ca', 'feat_c', 'feat_a'));

    const cycles = graph.detectCycles();
    expect(cycles.length).toBe(1);
    expect(cycles[0].classification).toBe('ARCHITECTURAL_RISK');
    expect(cycles[0].relationships.length).toBe(3);

    // Verify cycles are non-destructive: graph nodes and edges must be preserved
    expect(graph.size().nodes).toBe(3);
    expect(graph.size().edges).toBe(3);
    expect(graph.hasRelationship('feat_a', 'feat_b')).toBe(true);
  });

  it('should classify cycle as SUSPECTED_CYCLE if any relationship in cycle has low confidence', () => {
    graph.addRelationship(makeRel('rel_ab', 'feat_a', 'feat_b', 'DEPENDS_ON', 0.9));
    graph.addRelationship(makeRel('rel_ba', 'feat_b', 'feat_a', 'ASSOCIATED_WITH', 0.35));

    const cycles = graph.detectCycles();
    expect(cycles.length).toBe(1);
    expect(cycles[0].classification).toBe('SUSPECTED_CYCLE');
  });

  it('should return empty cycles for acyclic Directed Acyclic Graph (DAG)', () => {
    // A -> B -> C (no back-edge)
    graph.addRelationship(makeRel('rel_ab', 'feat_a', 'feat_b'));
    graph.addRelationship(makeRel('rel_bc', 'feat_b', 'feat_c'));

    const cycles = graph.detectCycles();
    expect(cycles.length).toBe(0);
  });
});
