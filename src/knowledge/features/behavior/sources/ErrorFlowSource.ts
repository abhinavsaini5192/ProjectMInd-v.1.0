import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class ErrorFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'ERROR_FLOW_SOURCE';
  public readonly sourceType = 'RESILIENCE';
  public readonly priority = 84;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // Look for error handling resources, exception filters, or error response mappers
    const errorMappings = context.mappings.filter(m => {
      if (m.active === false) return false;
      const lower = m.resourceId.toLowerCase();
      return (
        lower.includes('error') ||
        lower.includes('exception') ||
        lower.includes('filter') ||
        lower.includes('failure') ||
        lower.includes('fallback') ||
        m.metadata?.role === 'ERROR_HANDLER'
      );
    });

    for (const m of errorMappings) {
      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'ERROR_HANDLER_DETECTED',
        `Error handler detected in ${m.resourceId}`,
        0.86
      );

      const errNode = BehaviorSourceHelper.createNode(
        m.resourceId,
        m.resourceType,
        'ERROR_HANDLER',
        `Error Handler: ${m.resourceId}`,
        { errorHandler: m.resourceId },
        0.86
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Error Handling: ${m.resourceId}`,
          'FAILURE',
          [errNode],
          [],
          [ev],
          this.sourceId,
          0.86
        )
      );
    }

    // For each mapped endpoint, synthesize standard failure paths (e.g. 400 Bad Request, 401 Unauthorized)
    const endpoints = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'ENDPOINT');
    for (const ep of endpoints) {
      const method = ep.metadata?.method || 'POST';
      const route = ep.metadata?.path || ep.resourceId;

      const nodes: FeatureFlowNode[] = [];
      const edges: FeatureFlowEdge[] = [];

      const epNode = BehaviorSourceHelper.createNode(
        ep.resourceId,
        'ENDPOINT',
        'ENTRY_POINT',
        `${method} ${route}`,
        { method, route },
        0.9
      );
      nodes.push(epNode);

      const failNode = BehaviorSourceHelper.createNode(
        `${ep.resourceId}:failure`,
        'ENDPOINT',
        'ERROR_HANDLER',
        `Error Response (400/401/500): ${route}`,
        { isFailureBranch: true },
        0.88
      );
      nodes.push(failNode);

      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'ENDPOINT_FAILURE_PATH',
        `Synthesized error branch for ${route}`,
        0.85
      );

      edges.push(
        BehaviorSourceHelper.createEdge(
          epNode.nodeId,
          failNode.nodeId,
          'FAILS_TO',
          false,
          'error != null',
          0.85,
          [ev]
        )
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Failure Flow: ${method} ${route}`,
          'FAILURE',
          nodes,
          edges,
          [ev],
          this.sourceId,
          0.85,
          { isFailureBranch: true }
        )
      );
    }

    return candidates;
  }
}
