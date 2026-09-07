import type { BehaviorContext } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorConfidence } from '../models/FeatureBehaviorConfidence';
import { scoreToFeatureBehaviorConfidenceLevel } from '../models/FeatureBehaviorConfidence';
import type { FeatureBehaviorConflict } from '../models/FeatureBehaviorConflict';
import type { FeatureFlow } from '../models/FeatureFlow';
import { BehaviorSourceHelper } from '../sources/BehaviorSourceHelper';

export class FeatureBehaviorAnalyzer {
  /**
   * Annotate cross-feature boundary hops across all flows
   */
  public analyzeBoundaries(flows: FeatureFlow[], context: BehaviorContext): void {
    const currentFeatureId = context.feature.id;

    for (const flow of flows) {
      for (const node of flow.nodes) {
        const boundary = BehaviorSourceHelper.resolveFeatureBoundary(
          node.resourceId,
          currentFeatureId,
          context
        );

        if (boundary.isBoundary && boundary.targetFeatureId) {
          node.metadata = {
            ...node.metadata,
            featureBoundary: true,
            targetFeatureId: boundary.targetFeatureId,
            sourceFeatureId: currentFeatureId,
          };
        }
      }

      for (const edge of flow.edges) {
        const srcNode = flow.nodes.find(n => n.nodeId === edge.sourceNodeId);
        const tgtNode = flow.nodes.find(n => n.nodeId === edge.targetNodeId);

        if (tgtNode?.metadata?.featureBoundary) {
          edge.metadata = {
            ...edge.metadata,
            featureBoundary: true,
            targetFeatureId: tgtNode.metadata.targetFeatureId,
          };
        }
      }
    }
  }

  /**
   * Compute calibrated overall confidence for the feature's behavior
   */
  public computeConfidence(
    flows: FeatureFlow[],
    conflicts: FeatureBehaviorConflict[],
    context: BehaviorContext
  ): FeatureBehaviorConfidence {
    const reasons: string[] = [];

    if (flows.length === 0) {
      return {
        level: 'VERY_LOW',
        score: 0.1,
        reasons: ['No behavioral flows detected for this feature'],
      };
    }

    // Baseline average of flow confidence
    const flowScores = flows.map(f => f.confidence);
    let avg = flowScores.reduce((a, b) => a + b, 0) / flowScores.length;
    reasons.push(`Average flow confidence across ${flows.length} flows is ${(avg * 100).toFixed(1)}%`);

    // Corroboration bonus: test verification
    const hasTests = flows.some(f =>
      f.evidence.some(e => e.evidenceType === 'TEST_VERIFICATION_EVIDENCE')
    );
    if (hasTests) {
      avg = Math.min(1.0, avg + 0.08);
      reasons.push('Confidence boosted by test corroboration');
    }

    // Corroboration bonus: endpoint and call chain alignment
    const hasApiFlow = flows.some(f => f.flowType === 'API');
    const hasCallChain = flows.some(f =>
      f.evidence.some(e => e.sourceId === 'CALL_CHAIN_SOURCE')
    );
    if (hasApiFlow && hasCallChain) {
      avg = Math.min(1.0, avg + 0.05);
      reasons.push('Confidence boosted by API route to call-chain alignment');
    }

    // Conflict penalty
    const openConflicts = conflicts.filter(c => c.status === 'OPEN');
    if (openConflicts.length > 0) {
      const penalty = openConflicts.length * 0.15;
      avg = Math.max(0.1, avg - penalty);
      reasons.push(`Confidence reduced due to ${openConflicts.length} open behavioral conflict(s)`);
    }

    const finalScore = Math.round(avg * 100) / 100;
    const level = scoreToFeatureBehaviorConfidenceLevel(finalScore);

    return {
      level,
      score: finalScore,
      reasons,
    };
  }
}
