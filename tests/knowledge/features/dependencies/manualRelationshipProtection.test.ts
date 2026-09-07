import { describe, it, expect } from 'vitest';
import { FeatureRelationshipResolver } from '../../../../src/knowledge/features/dependencies/core/FeatureRelationshipResolver';
import { FeatureDependencyEngine } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureRelationshipRepository } from '../../../../src/knowledge/features/dependencies/repository/FeatureRelationshipRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';
import type { FeatureRelationshipCandidate } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipCandidate';

describe('Feature Dependency Graph: Manual Relationship Protection', () => {
  const resolver = new FeatureRelationshipResolver();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };

  it('should strictly preserve manual relationship type, direction, and source in resolver', () => {
    const existingManual: FeatureRelationship = {
      relationshipId: 'rel_manual_1',
      sourceFeatureId: 'feat_a' as any,
      targetFeatureId: 'feat_b' as any,
      relationshipType: 'COORDINATES', // User explicitly declared COORDINATES
      direction: 'BIDIRECTIONAL',
      confidence: { level: 'VERY_HIGH', score: 1.0, reasons: ['User manually curated'] },
      score: 1.0,
      evidence: [
        {
          evidenceId: 'ev_manual',
          sourceType: 'MANUAL',
          sourceId: 'user_override',
          evidenceType: 'HUMAN_CURATION',
          description: 'Team lead configured coordination',
          strength: 1.0,
          confidence: 1.0,
          metadata: {},
          timestamp: 0,
        },
      ],
      source: 'MANUAL',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };

    // Automated source proposes DEPENDS_ON with high score
    const autoCandidate: FeatureRelationshipCandidate = {
      candidateId: 'cand_auto',
      sourceFeatureId: 'feat_a',
      targetFeatureId: 'feat_b',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_auto',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/import.ts',
          evidenceType: 'IMPORT',
          description: 'Imports module',
          strength: 0.9,
          confidence: 0.9,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.9,
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const { resolvedRelationships } = resolver.resolve([autoCandidate], [existingManual]);
    expect(resolvedRelationships.length).toBe(1);
    const resolved = resolvedRelationships[0];

    // Verify protection: Type, direction, source MUST NOT change
    expect(resolved.relationshipId).toBe('rel_manual_1');
    expect(resolved.relationshipType).toBe('COORDINATES'); // Protected! Not overwritten by DEPENDS_ON
    expect(resolved.direction).toBe('BIDIRECTIONAL'); // Protected!
    expect(resolved.source).toBe('MANUAL'); // Protected!
    expect(resolved.relationshipVersion).toBe(2);
    // New evidence was safely appended
    expect(resolved.evidence.length).toBe(2);
  });

  it('should never deactivate manual relationships during stale sweeps in engine', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureRelationshipRepository();
    const featA = createDefaultFeature('feat_a' as any, 'Service A', scope);
    const featB = createDefaultFeature('feat_b' as any, 'Service B', scope);
    registry.register(featA);
    registry.register(featB);

    const manualRel: FeatureRelationship = {
      relationshipId: 'rel_manual_perm',
      sourceFeatureId: 'feat_a' as any,
      targetFeatureId: 'feat_b' as any,
      relationshipType: 'SPECIALIZES',
      direction: 'DIRECTED',
      confidence: { level: 'VERY_HIGH', score: 1.0, reasons: [] },
      score: 1.0,
      evidence: [],
      source: 'MANUAL',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };
    await repository.save(manualRel);

    const engine = new FeatureDependencyEngine(registry, repository);
    // Discover with empty context (no candidates detected by automated sources)
    const result = await engine.discoverRelationships('feat_a', { workspaceId: 'ws-1', repositoryId: 'repo-1' });

    // The manual relationship must NOT be deactivated
    expect(result.deactivatedRelationships.length).toBe(0);
    const inRepo = await repository.get('rel_manual_perm');
    expect(inRepo?.active).toBe(true);
  });
});
