import { IDependency } from '../models/Dependency';
import { DependencyChain } from '../models/DependencyChain';
import crypto from 'crypto';

export class DependencyGraphBuilder {
  /**
   * Explores the graph starting from sourceId to build a chain.
   */
  public buildChain(startId: string, dependencies: IDependency[], edgesFn: (nodeId: string) => IDependency[]): DependencyChain {
    const path: string[] = [startId];
    const chainDeps: IDependency[] = [];
    let isCircular = false;
    let confidenceSum = 1.0;

    const visited = new Set<string>();
    visited.add(startId);

    let currentNode = startId;
    
    // Simplistic DFS for chain extraction - limits depth to prevent infinite loops in raw builder
    let depth = 0;
    while(depth < 100) {
      const out = edgesFn(currentNode);
      if (out.length === 0) break;
      
      // For simplicity of a single chain builder, pick the first edge
      const edge = out[0];
      chainDeps.push(edge);
      confidenceSum *= edge.confidence;
      
      const nextNode = edge.targetId;
      path.push(nextNode);

      if (visited.has(nextNode)) {
        isCircular = true;
        break;
      }
      visited.add(nextNode);
      currentNode = nextNode;
      depth++;
    }

    const id = crypto.createHash('sha256').update(path.join('->')).digest('hex');

    return {
      id,
      path,
      dependencies: chainDeps,
      isCircular,
      totalConfidence: confidenceSum,
      maxLength: path.length
    };
  }
}
