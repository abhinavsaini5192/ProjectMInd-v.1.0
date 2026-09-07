import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';
import { BehaviorSourceHelper } from '../../../../src/knowledge/features/behavior/sources/BehaviorSourceHelper';
import type { IFeatureBehaviorSource, BehaviorContext } from '../../../../src/knowledge/features/behavior/interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../../../../src/knowledge/features/behavior/models/FeatureBehaviorCandidate';
import { FeatureBehaviorEngine } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorEngine';
import { FeatureBehaviorRepository } from '../../../../src/knowledge/features/behavior/repository/FeatureBehaviorRepository';

class ConflictingSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'CONFLICTING_SOURCE';
  public readonly sourceType = 'TEST';
  public readonly priority = 99;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const fid = context.feature.id;

    // Flow A: POST /login -> AuthService
    const nodeA1 = BehaviorSourceHelper.createNode('POST /login', 'ENDPOINT', 'ENTRY_POINT', 'POST /login', { route: '/login' });
    const nodeA2 = BehaviorSourceHelper.createNode('AuthService.login', 'SYMBOL', 'SERVICE', 'AuthService.login');
    const edgeA = BehaviorSourceHelper.createEdge(nodeA1.nodeId, nodeA2.nodeId, 'CALLS');

    const candA = BehaviorSourceHelper.createCandidate(fid, 'Primary Flow A', 'API', [nodeA1, nodeA2], [edgeA], [], this.sourceId);

    // Flow B: POST /login -> LegacyAuthService (Contradiction!)
    const nodeB1 = BehaviorSourceHelper.createNode('POST /login', 'ENDPOINT', 'ENTRY_POINT', 'POST /login', { route: '/login' });
    const nodeB2 = BehaviorSourceHelper.createNode('LegacyAuthService.login', 'SYMBOL', 'SERVICE', 'LegacyAuthService.login');
    const edgeB = BehaviorSourceHelper.createEdge(nodeB1.nodeId, nodeB2.nodeId, 'CALLS');

    const candB = BehaviorSourceHelper.createCandidate(fid, 'Contradictory Flow B', 'API', [nodeB1, nodeB2], [edgeB], [], this.sourceId);

    return [candA, candB];
  }
}

describe('Phase 6.5: Behavioral Path Conflict Detection & Resolution', () => {
  it('should detect conflicting execution paths for the same entry point and create FeatureBehaviorConflict', async () => {
    const feat = BehaviorTestHelper.createFeature('feat_conflict_test', 'Conflict Test');
    const context = BehaviorTestHelper.createContext(feat, []);

    const repository = new FeatureBehaviorRepository();
    const engine = new FeatureBehaviorEngine(repository, {
      sources: [new ConflictingSource()],
    });

    const result = await engine.analyzeFeatureBehavior('feat_conflict_test', context);

    expect(result.conflicts.length).toBeGreaterThan(0);
    const conflict = result.conflicts[0];

    expect(conflict.featureId).toBe('feat_conflict_test');
    expect(conflict.severity).toBe('HIGH');
    expect(conflict.status).toBe('OPEN');
    expect(conflict.reason).toContain('Contradictory execution paths');

    // Verify conflict saved in repository
    const storedConflicts = await repository.getConflicts('feat_conflict_test');
    expect(storedConflicts.length).toBe(1);

    // Resolve conflict
    await repository.resolveConflict(conflict.conflictId, 'Legacy service deprecated; use AuthService');
    const resolved = await repository.getConflicts('feat_conflict_test');
    expect(resolved[0].status).toBe('RESOLVED');
    expect(resolved[0].resolution).toBe('Legacy service deprecated; use AuthService');
  });
});
