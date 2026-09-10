import type { IImpactPropagator, PropagationOptions, PropagationResult } from '../interfaces/IImpactPropagator.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactNode } from '../models/ImpactNode.js';
import type { ImpactEdge } from '../models/ImpactEdge.js';
import type { ImpactConfidence } from '../models/ImpactConfidence.js';
import { ChangeSourceHelper } from '../sources/ChangeSource.js';
import { ImpactBoundaryResolver } from './ImpactBoundaryResolver.js';

export class DependencyImpactPropagator implements IImpactPropagator {
  public readonly name = 'DependencyImpactPropagator';

  public async propagate(
    candidates: ImpactCandidate[],
    context: ImpactContext,
    options?: PropagationOptions
  ): Promise<PropagationResult> {
    const maxDepth = options?.maxDepth ?? context.config.maxPropagationDepth ?? 5;
    const propagatedCandidates: ImpactCandidate[] = [];
    const generatedPaths: ImpactPath[] = [];
    const cyclesDetected: Array<{ cycle: string[]; description: string }> = [];
    let maxDepthReached = 0;
    let skippedNodes = 0;

    // Filter allowed relationships
    const allowedRelationships = ImpactBoundaryResolver.filterAllowedRelationships(
      context.relationships,
      context
    );

    // Build adjacency list: target -> dependents (who depends on target)
    // and source -> targets (for triggers/feeds/provides)
    const downstreamMap = new Map<string, Array<{ targetFeatureId: string; relationshipType: string; relId: string; score: number }>>();

    for (const rel of allowedRelationships) {
      // If B DEPENDS_ON A, then when A changes, B is affected downstream
      if (['DEPENDS_ON', 'CONSUMES', 'USES', 'REQUIRES', 'REQUIRED_BY'].includes(rel.relationshipType)) {
        const source = rel.targetFeatureId; // A
        const target = rel.sourceFeatureId; // B
        if (!downstreamMap.has(source)) downstreamMap.set(source, []);
        downstreamMap.get(source)!.push({
          targetFeatureId: target,
          relationshipType: rel.relationshipType,
          relId: rel.relationshipId,
          score: rel.score ?? 80,
        });
      }
      // If A TRIGGERS B or A FEEDS B, when A changes, B is affected
      else if (['TRIGGERS', 'FEEDS', 'PROVIDES', 'COORDINATES'].includes(rel.relationshipType)) {
        const source = rel.sourceFeatureId; // A
        const target = rel.targetFeatureId; // B
        if (!downstreamMap.has(source)) downstreamMap.set(source, []);
        downstreamMap.get(source)!.push({
          targetFeatureId: target,
          relationshipType: rel.relationshipType,
          relId: rel.relationshipId,
          score: rel.score ?? 80,
        });
      }
    }

    // Process each candidate starting from its targetFeatureId
    for (const cand of candidates) {
      if (!cand.targetFeatureId) continue;

      const originFeatureId = cand.targetFeatureId;
      const initialChange = cand.contributingChanges[0];
      const initialResource = cand.targetResourceId || initialChange?.targetId || originFeatureId;

      // Queue for BFS traversal: [currentFeatureId, currentDepth, currentPathNodes, currentPathEdges, visitedInBranch]
      interface QueueItem {
        currentFeatureId: string;
        depth: number;
        nodes: ImpactNode[];
        edges: ImpactEdge[];
        visitedInBranch: Set<string>;
      }

      const rootNode: ImpactNode = {
        nodeId: `node_${originFeatureId}`,
        resourceId: initialResource,
        resourceType: cand.targetResourceType || 'FEATURE',
        featureId: originFeatureId,
        nodeRole: cand.direct ? 'DIRECT_TARGET' : 'PROPAGATED_SOURCE',
        confidence: 0.95,
      };

      const queue: QueueItem[] = [
        {
          currentFeatureId: originFeatureId,
          depth: cand.distance,
          nodes: [rootNode],
          edges: [],
          visitedInBranch: new Set([originFeatureId]),
        },
      ];

      while (queue.length > 0) {
        const item = queue.shift()!;
        if (item.depth > maxDepthReached) {
          maxDepthReached = item.depth;
        }

        if (item.depth >= maxDepth) {
          skippedNodes++;
          continue;
        }

        const nextTransitions = downstreamMap.get(item.currentFeatureId) || [];

        for (const next of nextTransitions) {
          const nextFeatureId = next.targetFeatureId;

          // Cycle detection
          if (item.visitedInBranch.has(nextFeatureId)) {
            const cyclePath = [...item.visitedInBranch, nextFeatureId];
            cyclesDetected.push({
              cycle: cyclePath,
              description: `Cycle detected: ${cyclePath.join(' -> ')}`,
            });
            continue;
          }

          // Boundary check
          const nextNode: ImpactNode = {
            nodeId: `node_${nextFeatureId}`,
            resourceId: nextFeatureId,
            resourceType: 'FEATURE',
            featureId: nextFeatureId,
            nodeRole: 'DEPENDENT_FEATURE',
            confidence: Math.max(0.2, 0.95 - (item.depth + 1) * 0.15),
          };

          const boundary = ImpactBoundaryResolver.evaluateBoundary(
            item.nodes[item.nodes.length - 1]!,
            nextNode,
            next.relationshipType,
            context
          );

          if (!boundary.allow) {
            skippedNodes++;
            continue;
          }

          const edge: ImpactEdge = {
            sourceNodeId: item.nodes[item.nodes.length - 1]!.nodeId,
            targetNodeId: nextNode.nodeId,
            relationshipType: next.relationshipType,
            direction: 'DOWNSTREAM',
            confidence: next.score / 100,
            evidence: `${item.currentFeatureId} -> ${next.relationshipType} -> ${nextFeatureId}`,
          };

          const newNodes = [...item.nodes, nextNode];
          const newEdges = [...item.edges, edge];
          const newVisited = new Set(item.visitedInBranch);
          newVisited.add(nextFeatureId);
          const nextDepth = item.depth + 1;

          // Determine confidence based on distance
          let nextConfidence: ImpactConfidence = 'HIGH';
          if (nextDepth === 1) nextConfidence = 'HIGH';
          else if (nextDepth === 2) nextConfidence = 'MEDIUM';
          else nextConfidence = 'LOW';

          const pathEvidence = ChangeSourceHelper.createEvidence({
            source: 'DEPENDENCY',
            sourceId: next.relId,
            evidenceType: 'MULTI_HOP_DEPENDENCY_PROPAGATION',
            description: `Impact propagated from "${originFeatureId}" to "${nextFeatureId}" across distance ${nextDepth} via ${next.relationshipType}.`,
            confidence: next.score / 100,
            metadata: {
              distance: nextDepth,
              originFeatureId,
              targetFeatureId: nextFeatureId,
              chain: newNodes.map((n) => n.featureId || n.resourceId).join(' -> '),
            },
          });

          // Generate ImpactPath
          const path: ImpactPath = {
            pathId: `path_${originFeatureId}_to_${nextFeatureId}_d${nextDepth}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            sourceNode: rootNode,
            targetNode: nextNode,
            nodes: newNodes,
            edges: newEdges,
            pathType: boundary.divertToImpactType || 'INDIRECT',
            distance: nextDepth,
            confidence: nextConfidence,
            evidence: [pathEvidence],
          };
          generatedPaths.push(path);

          // Generate propagated candidate
          propagatedCandidates.push(
            ChangeSourceHelper.createCandidate({
              sourceChangeId: cand.sourceChangeId,
              targetFeatureId: nextFeatureId,
              impactType: boundary.divertToImpactType || 'INDIRECT',
              scope: 'FEATURE',
              direction: 'DOWNSTREAM',
              confidence: nextConfidence,
              severity: nextDepth >= 3 ? 'LOW' : 'MEDIUM',
              direct: false,
              distance: nextDepth,
              evidence: [pathEvidence],
              contributingChanges: cand.contributingChanges,
              metadata: {
                pathId: path.pathId,
                intermediaryFeatureIds: newNodes.slice(1, -1).map((n) => n.featureId),
              },
            })
          );

          // Add to queue for next hops
          queue.push({
            currentFeatureId: nextFeatureId,
            depth: nextDepth,
            nodes: newNodes,
            edges: newEdges,
            visitedInBranch: newVisited,
          });
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
