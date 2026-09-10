import type { IImpactPropagator, PropagationOptions, PropagationResult } from '../interfaces/IImpactPropagator.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactNode } from '../models/ImpactNode.js';
import type { ImpactEdge } from '../models/ImpactEdge.js';
import { ChangeSourceHelper } from '../sources/ChangeSource.js';

export class BehaviorImpactPropagator implements IImpactPropagator {
  public readonly name = 'BehaviorImpactPropagator';

  public async propagate(
    candidates: ImpactCandidate[],
    context: ImpactContext,
    options?: PropagationOptions
  ): Promise<PropagationResult> {
    const propagatedCandidates: ImpactCandidate[] = [];
    const generatedPaths: ImpactPath[] = [];
    const cyclesDetected: Array<{ cycle: string[]; description: string }> = [];
    const maxDepth = options?.maxDepth ?? context.config.maxPropagationDepth ?? 5;
    let maxDepthReached = 0;
    let skippedNodes = 0;

    if (!context.config.enableBehavioralPropagation || !context.behaviors) {
      return {
        propagatedCandidates,
        generatedPaths,
        maxDepthReached: 0,
        cyclesDetected: [],
        skippedNodes: 0,
      };
    }

    for (const cand of candidates) {
      if (cand.impactType !== 'BEHAVIORAL' || !cand.targetFeatureId) continue;

      const behavior = context.behaviors.get(cand.targetFeatureId);
      if (!behavior) continue;

      const flows = behavior.flows || [];
      for (const flow of flows) {
        // Find index of targetResourceId in flow
        const targetNodeIndex = flow.nodes.findIndex(
          (n: any) => n.resourceId === cand.targetResourceId || (cand.contributingChanges[0]?.name && n.label.includes(cand.contributingChanges[0].name))
        );

        if (targetNodeIndex >= 0) {
          const startNode = flow.nodes[targetNodeIndex]!;
          const downstreamSteps = flow.nodes.slice(targetNodeIndex + 1);

          if (downstreamSteps.length > 0) {
            maxDepthReached = Math.max(maxDepthReached, Math.min(downstreamSteps.length, maxDepth));

            // Create causal path through flow
            const sourceImpactNode: ImpactNode = {
              nodeId: `flow_node_${startNode.nodeId}`,
              resourceId: startNode.resourceId,
              resourceType: startNode.resourceType,
              featureId: cand.targetFeatureId,
              nodeRole: 'FLOW_ENTRY_STEP',
              confidence: startNode.confidence,
            };

            const pathNodes: ImpactNode[] = [sourceImpactNode];
            const pathEdges: ImpactEdge[] = [];

            let prevNode = sourceImpactNode;
            for (let i = 0; i < Math.min(downstreamSteps.length, maxDepth); i++) {
              const step = downstreamSteps[i]!;
              const stepImpactNode: ImpactNode = {
                nodeId: `flow_node_${step.nodeId}`,
                resourceId: step.resourceId,
                resourceType: step.resourceType,
                featureId: step.metadata?.targetFeatureId || cand.targetFeatureId,
                nodeRole: 'DOWNSTREAM_FLOW_STEP',
                confidence: step.confidence,
              };
              pathNodes.push(stepImpactNode);

              pathEdges.push({
                sourceNodeId: prevNode.nodeId,
                targetNodeId: stepImpactNode.nodeId,
                relationshipType: 'EXECUTES_NEXT',
                direction: 'DOWNSTREAM',
                confidence: 0.9,
                evidence: `Flow "${flow.name}" step ${i + 1}`,
              });
              prevNode = stepImpactNode;
            }

            const targetImpactNode = pathNodes[pathNodes.length - 1]!;
            const path: ImpactPath = {
              pathId: `flow_path_${flow.flowId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              sourceNode: sourceImpactNode,
              targetNode: targetImpactNode,
              nodes: pathNodes,
              edges: pathEdges,
              pathType: 'BEHAVIORAL',
              distance: pathNodes.length - 1,
              confidence: 'HIGH',
              evidence: cand.evidence,
            };
            generatedPaths.push(path);

            // If any downstream step crosses a feature boundary, emit candidate
            for (const step of downstreamSteps) {
              const targetFeatureId = step.metadata?.targetFeatureId;
              if (targetFeatureId && targetFeatureId !== cand.targetFeatureId) {
                const boundaryEvidence = ChangeSourceHelper.createEvidence({
                  source: 'BEHAVIOR',
                  sourceId: flow.flowId,
                  evidenceType: 'CROSS_FEATURE_FLOW_EXECUTION',
                  description: `Flow "${flow.name}" of "${cand.targetFeatureId}" cascades execution into feature "${targetFeatureId}".`,
                  confidence: 0.88,
                });

                propagatedCandidates.push(
                  ChangeSourceHelper.createCandidate({
                    sourceChangeId: cand.sourceChangeId,
                    targetFeatureId,
                    targetResourceId: step.resourceId,
                    targetResourceType: step.resourceType,
                    impactType: 'BEHAVIORAL',
                    scope: 'FEATURE',
                    direction: 'DOWNSTREAM',
                    confidence: 'HIGH',
                    severity: 'HIGH',
                    direct: false,
                    distance: 1,
                    evidence: [...cand.evidence, boundaryEvidence],
                    contributingChanges: cand.contributingChanges,
                    path,
                  })
                );
              }
            }
          }
        }
      }
    }

    return {
      propagatedCandidates,
      generatedPaths,
      maxDepthReached,
      cyclesDetected,
      skippedNodes,
    };
  }
}
