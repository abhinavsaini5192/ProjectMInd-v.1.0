import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyPath } from '../models/FeatureDependencyPath';
import type { FeatureDependencyCycle, CycleClassification } from '../models/FeatureDependencyCycle';
import type { IFeatureDependencyGraph } from '../interfaces/IFeatureDependencyGraph';

export class FeatureDependencyGraph implements IFeatureDependencyGraph {
  private nodes: Map<string, Feature> = new Map();
  // outgoing: sourceFeatureId -> Map<targetFeatureId, FeatureRelationship>
  private outgoing: Map<string, Map<string, FeatureRelationship>> = new Map();
  // incoming: targetFeatureId -> Map<sourceFeatureId, FeatureRelationship>
  private incoming: Map<string, Map<string, FeatureRelationship>> = new Map();
  // relationshipById: relId -> FeatureRelationship
  private relationshipById: Map<string, FeatureRelationship> = new Map();

  public addFeature(feature: Feature): void {
    this.nodes.set(feature.id, feature);
    if (!this.outgoing.has(feature.id)) {
      this.outgoing.set(feature.id, new Map());
    }
    if (!this.incoming.has(feature.id)) {
      this.incoming.set(feature.id, new Map());
    }
  }

  public removeFeature(featureId: string): void {
    this.nodes.delete(featureId);

    // Remove all outgoing edges from this feature
    const outEdges = this.outgoing.get(featureId);
    if (outEdges) {
      for (const [targetId, rel] of outEdges.entries()) {
        this.relationshipById.delete(rel.relationshipId);
        this.incoming.get(targetId)?.delete(featureId);
      }
      this.outgoing.delete(featureId);
    }

    // Remove all incoming edges to this feature
    const inEdges = this.incoming.get(featureId);
    if (inEdges) {
      for (const [sourceId, rel] of inEdges.entries()) {
        this.relationshipById.delete(rel.relationshipId);
        this.outgoing.get(sourceId)?.delete(featureId);
      }
      this.incoming.delete(featureId);
    }
  }

  public addRelationship(relationship: FeatureRelationship): void {
    if (!relationship.active) {
      return;
    }
    this.relationshipById.set(relationship.relationshipId, relationship);

    // Outgoing edge
    if (!this.outgoing.has(relationship.sourceFeatureId)) {
      this.outgoing.set(relationship.sourceFeatureId, new Map());
    }
    this.outgoing.get(relationship.sourceFeatureId)!.set(relationship.targetFeatureId, relationship);

    // Incoming edge
    if (!this.incoming.has(relationship.targetFeatureId)) {
      this.incoming.set(relationship.targetFeatureId, new Map());
    }
    this.incoming.get(relationship.targetFeatureId)!.set(relationship.sourceFeatureId, relationship);

    // If bidirectional, register reverse edge pointing to same relationship
    if (relationship.direction === 'BIDIRECTIONAL') {
      if (!this.outgoing.has(relationship.targetFeatureId)) {
        this.outgoing.set(relationship.targetFeatureId, new Map());
      }
      this.outgoing.get(relationship.targetFeatureId)!.set(relationship.sourceFeatureId, relationship);

      if (!this.incoming.has(relationship.sourceFeatureId)) {
        this.incoming.set(relationship.sourceFeatureId, new Map());
      }
      this.incoming.get(relationship.sourceFeatureId)!.set(relationship.targetFeatureId, relationship);
    }
  }

  public removeRelationship(relationshipId: string): void {
    const rel = this.relationshipById.get(relationshipId);
    if (!rel) return;

    this.relationshipById.delete(relationshipId);
    this.outgoing.get(rel.sourceFeatureId)?.delete(rel.targetFeatureId);
    this.incoming.get(rel.targetFeatureId)?.delete(rel.sourceFeatureId);

    if (rel.direction === 'BIDIRECTIONAL') {
      this.outgoing.get(rel.targetFeatureId)?.delete(rel.sourceFeatureId);
      this.incoming.get(rel.sourceFeatureId)?.delete(rel.targetFeatureId);
    }
  }

  public getFeature(featureId: string): Feature | undefined {
    return this.nodes.get(featureId);
  }

  public getAllFeatures(): Feature[] {
    return Array.from(this.nodes.values());
  }

  public getDependencies(featureId: string): Feature[] {
    const targets = this.outgoing.get(featureId);
    if (!targets) return [];
    const result: Feature[] = [];
    for (const targetId of targets.keys()) {
      const feat = this.nodes.get(targetId);
      if (feat) result.push(feat);
    }
    return result;
  }

  public getDependents(featureId: string): Feature[] {
    const sources = this.incoming.get(featureId);
    if (!sources) return [];
    const result: Feature[] = [];
    for (const sourceId of sources.keys()) {
      const feat = this.nodes.get(sourceId);
      if (feat) result.push(feat);
    }
    return result;
  }

  public getRelationships(featureId: string): FeatureRelationship[] {
    const rels = new Map<string, FeatureRelationship>();
    for (const rel of this.getOutgoingRelationships(featureId)) {
      rels.set(rel.relationshipId, rel);
    }
    for (const rel of this.getIncomingRelationships(featureId)) {
      rels.set(rel.relationshipId, rel);
    }
    return Array.from(rels.values());
  }

  public getOutgoingRelationships(featureId: string): FeatureRelationship[] {
    const outMap = this.outgoing.get(featureId);
    return outMap ? Array.from(outMap.values()) : [];
  }

  public getIncomingRelationships(featureId: string): FeatureRelationship[] {
    const inMap = this.incoming.get(featureId);
    return inMap ? Array.from(inMap.values()) : [];
  }

  public getRelationship(sourceId: string, targetId: string): FeatureRelationship | undefined {
    return this.outgoing.get(sourceId)?.get(targetId);
  }

  public hasRelationship(sourceId: string, targetId: string): boolean {
    return this.outgoing.get(sourceId)?.has(targetId) ?? false;
  }

  public findPath(sourceId: string, targetId: string): FeatureDependencyPath | null {
    if (sourceId === targetId) return null;
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;

    // Direct check
    const directRel = this.getRelationship(sourceId, targetId);
    if (directRel) {
      return {
        sourceFeatureId: sourceId,
        targetFeatureId: targetId,
        nodes: [sourceId, targetId],
        relationships: [directRel],
        totalConfidence: directRel.score,
        pathLength: 1,
      };
    }

    // BFS shortest path
    const queue: Array<{ current: string; path: string[]; rels: FeatureRelationship[] }> = [
      { current: sourceId, path: [sourceId], rels: [] },
    ];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const item = queue.shift()!;
      const { current, path, rels } = item;

      const outEdges = this.outgoing.get(current);
      if (!outEdges) continue;

      for (const [nextId, rel] of outEdges.entries()) {
        if (nextId === targetId) {
          const finalNodes = [...path, nextId];
          const finalRels = [...rels, rel];
          const totalConf = finalRels.reduce((acc, r) => acc * r.score, 1.0);
          return {
            sourceFeatureId: sourceId,
            targetFeatureId: targetId,
            nodes: finalNodes,
            relationships: finalRels,
            totalConfidence: Math.round(totalConf * 100) / 100,
            pathLength: finalRels.length,
          };
        }

        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({
            current: nextId,
            path: [...path, nextId],
            rels: [...rels, rel],
          });
        }
      }
    }

    return null;
  }

  public findDependencyChain(featureId: string): {
    upstream: Feature[];
    downstream: Feature[];
    paths: FeatureDependencyPath[];
  } {
    const upstreamSet = new Set<string>();
    const downstreamSet = new Set<string>();
    const paths: FeatureDependencyPath[] = [];

    // Upstream traversal (incoming: who depends on featureId?)
    const upQueue = [featureId];
    const upVisited = new Set<string>([featureId]);
    while (upQueue.length > 0) {
      const curr = upQueue.shift()!;
      const inEdges = this.incoming.get(curr);
      if (!inEdges) continue;
      for (const [sourceId] of inEdges.entries()) {
        if (!upVisited.has(sourceId)) {
          upVisited.add(sourceId);
          upstreamSet.add(sourceId);
          upQueue.push(sourceId);
          const p = this.findPath(sourceId, featureId);
          if (p) paths.push(p);
        }
      }
    }

    // Downstream traversal (outgoing: who does featureId depend on?)
    const downQueue = [featureId];
    const downVisited = new Set<string>([featureId]);
    while (downQueue.length > 0) {
      const curr = downQueue.shift()!;
      const outEdges = this.outgoing.get(curr);
      if (!outEdges) continue;
      for (const [targetId] of outEdges.entries()) {
        if (!downVisited.has(targetId)) {
          downVisited.add(targetId);
          downDownstreamSetAdd(downstreamSet, targetId);
          downQueue.push(targetId);
          const p = this.findPath(featureId, targetId);
          if (p) paths.push(p);
        }
      }
    }

    const upstreamFeatures: Feature[] = [];
    for (const id of upstreamSet) {
      const feat = this.nodes.get(id);
      if (feat) upstreamFeatures.push(feat);
    }

    const downstreamFeatures: Feature[] = [];
    for (const id of downstreamSet) {
      const feat = this.nodes.get(id);
      if (feat) downstreamFeatures.push(feat);
    }

    return {
      upstream: upstreamFeatures,
      downstream: downstreamFeatures,
      paths,
    };
  }

  public detectCycles(): FeatureDependencyCycle[] {
    const cycles: FeatureDependencyCycle[] = [];
    const visited = new Set<string>();
    const recStack: string[] = [];
    const inRecStack = new Set<string>();
    const foundCycleKeys = new Set<string>();

    const dfs = (node: string) => {
      visited.add(node);
      recStack.push(node);
      inRecStack.add(node);

      const outEdges = this.outgoing.get(node);
      if (outEdges) {
        for (const [targetId, rel] of outEdges.entries()) {
          if (!visited.has(targetId)) {
            dfs(targetId);
          } else if (inRecStack.has(targetId)) {
            // Cycle detected!
            const cycleStartIndex = recStack.indexOf(targetId);
            const cycleNodes = recStack.slice(cycleStartIndex); // [targetId, ..., node]
            const fullCycleNodes = [...cycleNodes, targetId];

            // Canonical key for deduplication (normalize rotation)
            const minNode = cycleNodes.length > 0
              ? cycleNodes.reduce((min, n) => (n < min ? n : min), cycleNodes[0]!)
              : '';
            const minIdx = minNode ? cycleNodes.indexOf(minNode) : 0;
            const canonicalCycle = [...cycleNodes.slice(minIdx), ...cycleNodes.slice(0, minIdx)];
            const key = canonicalCycle.join('->');

            if (!foundCycleKeys.has(key)) {
              foundCycleKeys.add(key);

              // Gather relationships along cycle
              const cycleRels: FeatureRelationship[] = [];
              for (let i = 0; i < fullCycleNodes.length - 1; i++) {
                const s = fullCycleNodes[i];
                const t = fullCycleNodes[i + 1];
                if (s && t) {
                  const edgeRel = this.getRelationship(s, t);
                  if (edgeRel) {
                    cycleRels.push(edgeRel);
                  }
                }
              }

              // Classification logic
              const minConf = Math.min(...cycleRels.map((r) => r.score), 1.0);
              const allDependsOn = cycleRels.every((r) => r.relationshipType === 'DEPENDS_ON');
              let classification: CycleClassification = 'VALIDATED_CYCLE';

              if (minConf < 0.5) {
                classification = 'SUSPECTED_CYCLE';
              } else if (allDependsOn && cycleRels.length >= 2) {
                classification = 'ARCHITECTURAL_RISK';
              }

              const allEvidence = cycleRels.flatMap((r) => r.evidence || []);

              cycles.push({
                cycleId: `cycle_${randomUUID()}`,
                features: fullCycleNodes,
                relationships: cycleRels,
                confidence: minConf,
                evidence: allEvidence,
                classification,
                createdAt: Date.now(),
              });
            }
          }
        }
      }

      recStack.pop();
      inRecStack.delete(node);
    };

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  public getNeighbors(featureId: string): Feature[] {
    const neighborIds = new Set<string>();
    const outEdges = this.outgoing.get(featureId);
    if (outEdges) {
      for (const t of outEdges.keys()) neighborIds.add(t);
    }
    const inEdges = this.incoming.get(featureId);
    if (inEdges) {
      for (const s of inEdges.keys()) neighborIds.add(s);
    }

    const result: Feature[] = [];
    for (const id of neighborIds) {
      const feat = this.nodes.get(id);
      if (feat) result.push(feat);
    }
    return result;
  }

  public getIsolatedFeatures(): Feature[] {
    const isolated: Feature[] = [];
    for (const [id, feat] of this.nodes.entries()) {
      const outCount = this.outgoing.get(id)?.size ?? 0;
      const inCount = this.incoming.get(id)?.size ?? 0;
      if (outCount === 0 && inCount === 0) {
        isolated.push(feat);
      }
    }
    return isolated;
  }

  public size(): { nodes: number; edges: number } {
    return {
      nodes: this.nodes.size,
      edges: this.relationshipById.size,
    };
  }

  public clear(): void {
    this.nodes.clear();
    this.outgoing.clear();
    this.incoming.clear();
    this.relationshipById.clear();
  }
}

function downDownstreamSetAdd(set: Set<string>, val: string) {
  set.add(val);
}
