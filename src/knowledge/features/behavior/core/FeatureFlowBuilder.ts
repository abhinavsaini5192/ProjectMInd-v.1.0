import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { IFeatureFlowBuilder } from '../interfaces/IFeatureFlowBuilder';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureBehaviorEvidence } from '../models/FeatureBehaviorEvidence';
import type { FeatureFlow } from '../models/FeatureFlow';
import type { FeatureFlowDirection } from '../models/FeatureFlowDirection';
import type { FeatureFlowEdge } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode } from '../models/FeatureFlowNode';
import type { FeatureFlowType } from '../models/FeatureFlowType';
import { BehaviorSourceHelper } from '../sources/BehaviorSourceHelper';

export class FeatureFlowBuilder implements IFeatureFlowBuilder {
  public async buildFlows(
    candidates: FeatureBehaviorCandidate[],
    context: BehaviorContext
  ): Promise<FeatureFlow[]> {
    const flows: FeatureFlow[] = [];
    const featureId = context.feature.id;

    if (candidates.length === 0) {
      return flows;
    }

    // 1. Separate candidates by category
    const failureCandidates = candidates.filter(c => c.flowType === 'FAILURE');
    const entryCandidates = candidates.filter(
      c => c.flowType !== 'FAILURE' && c.nodes.some(n => n.stepType === 'ENTRY_POINT')
    );
    const nonEntryCandidates = candidates.filter(
      c => c.flowType !== 'FAILURE' && !c.nodes.some(n => n.stepType === 'ENTRY_POINT')
    );

    // Sort entry candidates by node count descending so richer candidates seed first
    entryCandidates.sort((a, b) => b.nodes.length - a.nodes.length);

    // Build cohesive flows around each distinct entry candidate
    if (entryCandidates.length > 0) {
      for (const entryCand of entryCandidates) {
        const entryResId = entryCand.nodes.find(n => n.stepType === 'ENTRY_POINT')?.resourceId;

        // Check if an existing flow already has this entry point
        const existingFlow = flows.find(f => f.nodes.some(n => n.resourceId === entryResId));
        if (existingFlow) {
          // If the entry candidate is just a single-node stub (e.g. from EntryPointSource), merge evidence
          if (entryCand.nodes.length === 1) {
            existingFlow.evidence.push(...entryCand.evidence);
            continue;
          }

          // If both have the same downstream service/controller, merge
          const existingService = existingFlow.nodes.find(
            n => n.stepType === 'SERVICE' || n.stepType === 'CONTROLLER'
          )?.resourceId;
          const candidateService = entryCand.nodes.find(
            n => n.stepType === 'SERVICE' || n.stepType === 'CONTROLLER'
          )?.resourceId;

          if (existingService && candidateService && existingService === candidateService) {
            existingFlow.evidence.push(...entryCand.evidence);
            continue;
          }
        }

        const flow = this.buildFlowFromSeed(entryCand, nonEntryCandidates, context);
        flows.push(flow);
      }
    }

    // Process dedicated failure flows
    for (const failCand of failureCandidates) {
      const flow = this.candidateToFlow(failCand);
      flow.flowType = 'FAILURE';
      flows.push(flow);
    }

    // Process remaining non-entry candidates that weren't stitched into entry flows
    // (e.g. standalone background events, data pipelines, decision branches)
    for (const cand of nonEntryCandidates) {
      const alreadyIntegrated = flows.some(f =>
        cand.nodes.every(cn => f.nodes.some(fn => fn.resourceId === cn.resourceId))
      );

      if (
        !alreadyIntegrated ||
        cand.flowType === 'DATA' ||
        cand.flowType === 'EVENT' ||
        cand.flowType === 'ALTERNATIVE'
      ) {
        const flow = this.candidateToFlow(cand);
        flows.push(flow);
      }
    }

    return flows;
  }

  private buildFlowFromSeed(
    seed: FeatureBehaviorCandidate,
    fragments: FeatureBehaviorCandidate[],
    context: BehaviorContext
  ): FeatureFlow {
    const featureId = context.feature.id;
    const nodesMap = new Map<string, FeatureFlowNode>();
    const edgesList: FeatureFlowEdge[] = [];
    const evidenceList: FeatureBehaviorEvidence[] = [...seed.evidence];

    // Add seed nodes
    for (const n of seed.nodes) {
      nodesMap.set(n.resourceId, { ...n });
    }
    edgesList.push(...seed.edges);

    // Look for validation stages to stitch
    const validationCandidates = fragments.filter(f => f.flowType === 'VALIDATION');
    for (const vc of validationCandidates) {
      for (const vn of vc.nodes) {
        if (!nodesMap.has(vn.resourceId)) {
          nodesMap.set(vn.resourceId, { ...vn });
          evidenceList.push(...vc.evidence);
        }
      }
    }

    // Look for authorization stages to stitch
    const authCandidates = fragments.filter(f => f.flowType === 'AUTHORIZATION');
    for (const ac of authCandidates) {
      for (const an of ac.nodes) {
        if (!nodesMap.has(an.resourceId)) {
          nodesMap.set(an.resourceId, { ...an });
          evidenceList.push(...ac.evidence);
        }
      }
    }

    // Look for call chains, services, and repositories to stitch
    const callChainCandidates = fragments.filter(
      f => f.sources.includes('CALL_CHAIN_SOURCE') || f.flowType === 'PRIMARY'
    );
    for (const cc of callChainCandidates) {
      for (const cn of cc.nodes) {
        if (!nodesMap.has(cn.resourceId)) {
          nodesMap.set(cn.resourceId, { ...cn });
          evidenceList.push(...cc.evidence);
        }
      }
      for (const ce of cc.edges) {
        const srcNode = Array.from(nodesMap.values()).find(n => n.nodeId === ce.sourceNodeId);
        const tgtNode = Array.from(nodesMap.values()).find(n => n.nodeId === ce.targetNodeId);
        if (srcNode && tgtNode) {
          edgesList.push(ce);
        }
      }
    }

    // Look for database nodes to stitch
    const dbCandidates = fragments.filter(
      f => f.flowType === 'DATA' || f.sources.includes('DATABASE_FLOW_SOURCE')
    );
    for (const dc of dbCandidates) {
      for (const dn of dc.nodes) {
        if (!nodesMap.has(dn.resourceId)) {
          nodesMap.set(dn.resourceId, { ...dn });
          evidenceList.push(...dc.evidence);
        }
      }
    }

    // Look for external services
    const intCandidates = fragments.filter(f => f.flowType === 'INTEGRATION');
    for (const ic of intCandidates) {
      for (const inNode of ic.nodes) {
        if (!nodesMap.has(inNode.resourceId)) {
          nodesMap.set(inNode.resourceId, { ...inNode });
          evidenceList.push(...ic.evidence);
        }
      }
    }

    // If it's an API flow and has no RESPONSE node, ensure a response node exists
    const hasResponse = Array.from(nodesMap.values()).some(
      n => n.stepType === 'RESPONSE' || n.stepType === 'EXIT'
    );
    if (!hasResponse && seed.flowType === 'API') {
      const respNode = BehaviorSourceHelper.createNode(
        `${seed.nodes[0]?.resourceId || 'api'}:response`,
        'ENDPOINT',
        'RESPONSE',
        `Response (200 OK)`,
        { statusCode: 200 },
        0.9
      );
      nodesMap.set(respNode.resourceId, respNode);
    }

    const allNodes = Array.from(nodesMap.values());

    // Connect any unconnected nodes logically based on tier hierarchy
    this.stitchArchitecturalTiers(allNodes, edgesList, evidenceList);

    // Identify entry node and exit nodes
    const entryNode = allNodes.find(n => n.stepType === 'ENTRY_POINT') || allNodes[0];
    const targetNodeIds = new Set(edgesList.map(e => e.targetNodeId));
    const sourceNodeIds = new Set(edgesList.map(e => e.sourceNodeId));

    const exitNodes = allNodes.filter(n => {
      if (n.stepType === 'RESPONSE' || n.stepType === 'EXIT' || n.stepType === 'ERROR_HANDLER')
        return true;
      return !sourceNodeIds.has(n.nodeId) && n.nodeId !== entryNode?.nodeId;
    });

    const exitNodeIds =
      exitNodes.length > 0 ? exitNodes.map(n => n.nodeId) : entryNode ? [entryNode.nodeId] : [];

    // Compute aggregate confidence
    const confScores = allNodes.map(n => n.confidence);
    const avgConf =
      confScores.length > 0 ? confScores.reduce((a, b) => a + b, 0) / confScores.length : 0.8;

    return {
      flowId: BehaviorSourceHelper.generateId('flow'),
      featureId,
      name: seed.name,
      flowType: seed.flowType,
      direction: 'FORWARD',
      nodes: allNodes,
      edges: edgesList,
      entryNodeId: entryNode?.nodeId,
      exitNodeIds,
      confidence: Math.round(avgConf * 100) / 100,
      evidence: evidenceList,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private stitchArchitecturalTiers(
    nodes: FeatureFlowNode[],
    edges: FeatureFlowEdge[],
    evidenceList: FeatureBehaviorEvidence[]
  ): void {
    const tierPriority: Record<string, number> = {
      ENTRY_POINT: 0,
      VALIDATION: 1,
      AUTHORIZATION: 2,
      CONTROLLER: 3,
      HANDLER: 3,
      SERVICE: 4,
      FUNCTION: 5,
      REPOSITORY: 6,
      DATABASE: 7,
      CACHE: 7,
      EXTERNAL_SERVICE: 8,
      EVENT: 8,
      QUEUE: 8,
      TRANSFORMATION: 9,
      CONDITION: 10,
      ERROR_HANDLER: 11,
      RESPONSE: 12,
      EXIT: 13,
    };

    const sorted = [...nodes].sort((a, b) => {
      const pA = tierPriority[a.stepType] ?? 50;
      const pB = tierPriority[b.stepType] ?? 50;
      return pA - pB;
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const src = sorted[i];
      const tgt = sorted[i + 1];
      if (src.stepType === 'RESPONSE' || src.stepType === 'EXIT') continue;

      const edgeExists = edges.some(
        e => e.sourceNodeId === src.nodeId && e.targetNodeId === tgt.nodeId
      );
      if (!edgeExists && src.nodeId !== tgt.nodeId) {
        const ev = BehaviorSourceHelper.createEvidence(
          'ARCHITECTURAL',
          'FLOW_BUILDER',
          'TIER_TRANSITION',
          `Tier transition from ${src.stepType} (${src.label}) to ${tgt.stepType} (${tgt.label})`,
          0.85
        );
        evidenceList.push(ev);

        let relType: any = 'CALLS';
        if (tgt.stepType === 'VALIDATION') relType = 'VALIDATES';
        else if (tgt.stepType === 'AUTHORIZATION') relType = 'AUTHORIZES';
        else if (tgt.stepType === 'DATABASE') relType = 'WRITES';
        else if (tgt.stepType === 'RESPONSE') relType = 'RETURNS';
        else if (tgt.stepType === 'ERROR_HANDLER') relType = 'FAILS_TO';
        else if (tgt.stepType === 'TRANSFORMATION') relType = 'TRANSFORMS';
        else if (tgt.stepType === 'EVENT' || tgt.stepType === 'QUEUE') relType = 'EMITS';

        edges.push(
          BehaviorSourceHelper.createEdge(
            src.nodeId,
            tgt.nodeId,
            relType,
            tgt.metadata?.asynchronous === true,
            undefined,
            0.85,
            [ev]
          )
        );
      }
    }
  }

  private candidateToFlow(cand: FeatureBehaviorCandidate): FeatureFlow {
    const entryNode = cand.nodes.find(n => n.stepType === 'ENTRY_POINT') || cand.nodes[0];
    const sourceNodeIds = new Set(cand.edges.map(e => e.sourceNodeId));
    const exitNodes = cand.nodes.filter(
      n => !sourceNodeIds.has(n.nodeId) && n.nodeId !== entryNode?.nodeId
    );
    const exitNodeIds =
      exitNodes.length > 0 ? exitNodes.map(n => n.nodeId) : entryNode ? [entryNode.nodeId] : [];

    return {
      flowId: BehaviorSourceHelper.generateId('flow'),
      featureId: cand.featureId,
      name: cand.name,
      flowType: cand.flowType,
      direction: 'FORWARD',
      nodes: [...cand.nodes],
      edges: [...cand.edges],
      entryNodeId: entryNode?.nodeId,
      exitNodeIds,
      confidence: cand.confidence,
      evidence: [...cand.evidence],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}
