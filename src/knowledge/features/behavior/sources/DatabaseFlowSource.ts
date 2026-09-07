import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class DatabaseFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'DATABASE_FLOW_SOURCE';
  public readonly sourceType = 'STORAGE';
  public readonly priority = 75;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    const dbMappings = context.mappings.filter(
      m => m.active !== false && (m.resourceType === 'DATABASE' || m.resourceType === 'DATABASE_ENTITY')
    );
    const repos = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'SYMBOL').filter(
      s => s.metadata?.role === 'REPOSITORY' || s.resourceId.toLowerCase().includes('repository')
    );

    for (const db of dbMappings) {
      const nodes: FeatureFlowNode[] = [];
      const edges: FeatureFlowEdge[] = [];

      const dbNode = BehaviorSourceHelper.createNode(
        db.resourceId,
        db.resourceType,
        'DATABASE',
        `Database: ${db.resourceId}`,
        { entity: db.resourceId },
        0.9
      );
      nodes.push(dbNode);

      // Connect repository if available
      const matchingRepo = repos[0];
      if (matchingRepo) {
        const repoNode = BehaviorSourceHelper.createNode(
          matchingRepo.resourceId,
          'SYMBOL',
          'REPOSITORY',
          matchingRepo.resourceId,
          { role: 'REPOSITORY' },
          0.88
        );
        nodes.unshift(repoNode);

        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'REPOSITORY_DATABASE_ACCESS',
          `Repository ${repoNode.label} accesses database ${dbNode.label}`,
          0.88
        );
        edges.push(
          BehaviorSourceHelper.createEdge(repoNode.nodeId, dbNode.nodeId, 'WRITES', false, undefined, 0.88, [ev])
        );
      }

      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'DATABASE_PERSISTENCE_FLOW',
        `Database persistence flow for ${db.resourceId}`,
        0.85
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Database Flow: ${db.resourceId}`,
          'DATA',
          nodes,
          edges,
          [ev],
          this.sourceId,
          0.85,
          { entity: db.resourceId }
        )
      );
    }

    return candidates;
  }
}
