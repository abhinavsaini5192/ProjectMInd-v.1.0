import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class DataFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'DATA_FLOW_SOURCE';
  public readonly sourceType = 'DATA_FLOW';
  public readonly priority = 80;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // Look for data transfer objects, entities, transformations, or serialization
    const mappings = context.mappings.filter(m => m.active !== false);
    const dataRelated = mappings.filter(m => {
      const lower = m.resourceId.toLowerCase();
      return (
        m.resourceType === 'DATABASE_ENTITY' ||
        lower.includes('dto') ||
        lower.includes('request') ||
        lower.includes('response') ||
        lower.includes('schema') ||
        lower.includes('entity') ||
        lower.includes('token') ||
        lower.includes('session')
      );
    });

    if (dataRelated.length >= 2) {
      const nodes: FeatureFlowNode[] = [];
      const edges: FeatureFlowEdge[] = [];

      for (let i = 0; i < dataRelated.length; i++) {
        const m = dataRelated[i];
        const sanitizedLabel = BehaviorSourceHelper.sanitize(m.resourceId);
        const node = BehaviorSourceHelper.createNode(
          m.resourceId,
          m.resourceType,
          'TRANSFORMATION',
          `Data: ${sanitizedLabel}`,
          {
            dataType: m.resourceType,
            sanitized: true,
          },
          0.82
        );
        nodes.push(node);
      }

      for (let i = 0; i < nodes.length - 1; i++) {
        const src = nodes[i];
        const tgt = nodes[i + 1];
        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'DATA_TRANSFORMATION_EDGE',
          `Data transformation from ${src.label} to ${tgt.label}`,
          0.8
        );
        edges.push(
          BehaviorSourceHelper.createEdge(
            src.nodeId,
            tgt.nodeId,
            'TRANSFORMS',
            false,
            undefined,
            0.8,
            [ev]
          )
        );
      }

      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'DATA_TRANSFORMATION_FLOW',
        `Reconstructed data pipeline with ${nodes.length} transformation steps`,
        0.82
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Data Transformation Pipeline (${nodes[0].label} -> ${nodes[nodes.length - 1].label})`,
          'DATA',
          nodes,
          edges,
          [ev],
          this.sourceId,
          0.82
        )
      );
    }

    return candidates;
  }
}
