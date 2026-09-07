import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class EndpointFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'ENDPOINT_FLOW_SOURCE';
  public readonly sourceType = 'API';
  public readonly priority = 88;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    const endpoints = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'ENDPOINT');
    const controllers = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'SYMBOL').filter(
      s => s.metadata?.role === 'CONTROLLER' || s.resourceId.toLowerCase().includes('controller')
    );
    const services = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'SYMBOL').filter(
      s => s.metadata?.role === 'SERVICE' || s.resourceId.toLowerCase().includes('service')
    );

    for (const ep of endpoints) {
      const nodes: FeatureFlowNode[] = [];
      const edges: FeatureFlowEdge[] = [];
      const method = ep.metadata?.method || 'POST';
      const route = ep.metadata?.path || ep.resourceId;

      // 1. Entry node
      const entryNode = BehaviorSourceHelper.createNode(
        ep.resourceId,
        'ENDPOINT',
        'ENTRY_POINT',
        `${method} ${route}`,
        { entryPointType: 'API', method, route, operation: `${method} ${route}` },
        0.95
      );
      nodes.push(entryNode);

      let prevNode = entryNode;

      // 2. Controller node
      const matchingController = controllers[0];
      if (matchingController) {
        const ctrlNode = BehaviorSourceHelper.createNode(
          matchingController.resourceId,
          'SYMBOL',
          'CONTROLLER',
          matchingController.resourceId,
          { role: 'CONTROLLER' },
          0.9
        );
        nodes.push(ctrlNode);

        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'ENDPOINT_ROUTING',
          `Route ${route} routes to controller ${ctrlNode.label}`,
          0.9
        );
        edges.push(
          BehaviorSourceHelper.createEdge(prevNode.nodeId, ctrlNode.nodeId, 'CALLS', false, undefined, 0.9, [ev])
        );
        prevNode = ctrlNode;
      }

      // 3. Service node
      const matchingService = services[0];
      if (matchingService) {
        const svcNode = BehaviorSourceHelper.createNode(
          matchingService.resourceId,
          'SYMBOL',
          'SERVICE',
          matchingService.resourceId,
          { role: 'SERVICE' },
          0.88
        );
        nodes.push(svcNode);

        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'CONTROLLER_SERVICE_CALL',
          `Controller invokes service ${svcNode.label}`,
          0.88
        );
        edges.push(
          BehaviorSourceHelper.createEdge(prevNode.nodeId, svcNode.nodeId, 'CALLS', false, undefined, 0.88, [ev])
        );
        prevNode = svcNode;
      }

      // 4. Response node
      const respNode = BehaviorSourceHelper.createNode(
        `${ep.resourceId}:response`,
        'ENDPOINT',
        'RESPONSE',
        `Response: 200 OK (${method} ${route})`,
        { statusCode: 200 },
        0.9
      );
      nodes.push(respNode);

      const respEv = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'API_RESPONSE_RETURN',
        `Flow returns HTTP response for ${route}`,
        0.9
      );
      edges.push(
        BehaviorSourceHelper.createEdge(prevNode.nodeId, respNode.nodeId, 'RETURNS', false, undefined, 0.9, [respEv])
      );

      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'ENDPOINT_EXECUTION_FLOW',
        `Complete API execution flow for ${method} ${route}`,
        0.92
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `API Flow: ${method} ${route}`,
          'API',
          nodes,
          edges,
          [ev],
          this.sourceId,
          0.92,
          { route, method }
        )
      );
    }

    return candidates;
  }
}
