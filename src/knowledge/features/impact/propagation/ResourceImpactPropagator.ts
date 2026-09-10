import type { IImpactPropagator, PropagationOptions, PropagationResult } from '../interfaces/IImpactPropagator.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactNode } from '../models/ImpactNode.js';
import type { ImpactEdge } from '../models/ImpactEdge.js';
import { ChangeSourceHelper } from '../sources/ChangeSource.js';

export class ResourceImpactPropagator implements IImpactPropagator {
  public readonly name = 'ResourceImpactPropagator';

  public async propagate(
    candidates: ImpactCandidate[],
    context: ImpactContext,
    options?: PropagationOptions
  ): Promise<PropagationResult> {
    const propagatedCandidates: ImpactCandidate[] = [];
    const generatedPaths: ImpactPath[] = [];
    const visited = options?.visitedNodes || new Set<string>();

    for (const cand of candidates) {
      if (!cand.targetResourceId) continue;

      const resourceKey = `res_${cand.targetResourceId}`;
      if (visited.has(resourceKey)) continue;
      visited.add(resourceKey);

      // Symbol -> File propagation
      if (cand.scope === 'SYMBOL' || (cand.targetResourceType === 'SYMBOL' && cand.contributingChanges[0]?.filePath)) {
        const filePath = cand.contributingChanges[0]?.filePath;
        if (filePath && !visited.has(`res_${filePath}`)) {
          visited.add(`res_${filePath}`);

          const sourceNode: ImpactNode = {
            nodeId: `node_${cand.targetResourceId}`,
            resourceId: cand.targetResourceId,
            resourceType: 'SYMBOL',
            featureId: cand.targetFeatureId,
            nodeRole: 'MODIFIED_SYMBOL',
            confidence: 0.95,
          };

          const targetNode: ImpactNode = {
            nodeId: `node_${filePath}`,
            resourceId: filePath,
            resourceType: 'FILE',
            featureId: cand.targetFeatureId,
            nodeRole: 'CONTAINING_FILE',
            confidence: 0.95,
          };

          const edge: ImpactEdge = {
            sourceNodeId: sourceNode.nodeId,
            targetNodeId: targetNode.nodeId,
            relationshipType: 'CONTAINED_IN',
            direction: 'UPSTREAM',
            confidence: 0.95,
            evidence: `Symbol ${cand.targetResourceId} is declared in ${filePath}`,
          };

          const path: ImpactPath = {
            pathId: `path_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            sourceNode,
            targetNode,
            nodes: [sourceNode, targetNode],
            edges: [edge],
            pathType: 'RESOURCE',
            distance: 1,
            confidence: 'VERY_HIGH',
            evidence: cand.evidence,
          };
          generatedPaths.push(path);

          const fileEvidence = ChangeSourceHelper.createEvidence({
            source: 'RESOURCE_RELATIONSHIP',
            sourceId: filePath,
            evidenceType: 'SYMBOL_TO_FILE_PROPAGATION',
            description: `File "${filePath}" impacted via changed symbol "${cand.targetResourceId}".`,
            confidence: 0.95,
          });

          propagatedCandidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: cand.sourceChangeId,
              targetFeatureId: cand.targetFeatureId,
              targetResourceId: filePath,
              targetResourceType: 'FILE',
              impactType: 'RESOURCE',
              scope: 'FILE',
              direction: 'UPSTREAM',
              confidence: 'VERY_HIGH',
              severity: cand.severity,
              direct: false,
              distance: cand.distance + 1,
              evidence: [...cand.evidence, fileEvidence],
              contributingChanges: cand.contributingChanges,
            })
          );
        }
      }
    }

    return {
      propagatedCandidates,
      generatedPaths,
      maxDepthReached: 1,
      cyclesDetected: [],
      skippedNodes: 0,
    };
  }
}
