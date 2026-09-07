import type { FeatureFlow } from '../models/FeatureFlow';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';

export class FeatureBehaviorNormalizer {
  /**
   * Deduplicate equivalent flows and eliminate redundant edges
   */
  public normalizeFlows(flows: FeatureFlow[]): FeatureFlow[] {
    const uniqueFlows: FeatureFlow[] = [];

    for (const flow of flows) {
      // Check if an equivalent flow already exists
      const existing = uniqueFlows.find(f => this.areFlowsEquivalent(f, flow));
      if (existing) {
        // Merge evidence and take the maximum confidence
        existing.confidence = Math.max(existing.confidence, flow.confidence);
        for (const ev of flow.evidence) {
          if (!existing.evidence.some(e => e.evidenceId === ev.evidenceId)) {
            existing.evidence.push(ev);
          }
        }
        // Merge any new nodes
        for (const n of flow.nodes) {
          if (!existing.nodes.some(en => en.resourceId === n.resourceId)) {
            existing.nodes.push(n);
          }
        }
        // Merge any new edges
        for (const e of flow.edges) {
          if (
            !existing.edges.some(
              ee =>
                ee.sourceNodeId === e.sourceNodeId &&
                ee.targetNodeId === e.targetNodeId &&
                ee.relationType === e.relationType
            )
          ) {
            existing.edges.push(e);
          }
        }
      } else {
        // Deduplicate edges inside the flow
        const cleanFlow = { ...flow, edges: this.deduplicateEdges(flow.edges) };
        uniqueFlows.push(cleanFlow);
      }
    }

    return uniqueFlows;
  }

  private areFlowsEquivalent(a: FeatureFlow, b: FeatureFlow): boolean {
    if (a.featureId !== b.featureId) return false;
    if (a.flowType !== b.flowType) return false;

    // Compare node resource IDs
    const resA = a.nodes.map(n => n.resourceId).sort();
    const resB = b.nodes.map(n => n.resourceId).sort();

    if (resA.length !== resB.length) return false;
    for (let i = 0; i < resA.length; i++) {
      if (resA[i] !== resB[i]) return false;
    }

    return true;
  }

  private deduplicateEdges(edges: FeatureFlowEdge[]): FeatureFlowEdge[] {
    const seen = new Set<string>();
    const result: FeatureFlowEdge[] = [];

    for (const e of edges) {
      const key = `${e.sourceNodeId}->${e.targetNodeId}:${e.relationType}:${e.condition || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(e);
      }
    }

    return result;
  }
}
