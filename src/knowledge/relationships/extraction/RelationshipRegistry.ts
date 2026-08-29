import { Relationship } from '../models/Relationship';

export class RelationshipRegistry {
  private relationships: Map<string, Relationship> = new Map();
  // Reverse indices for fast O(1) graph traversal
  private outgoingEdges: Map<string, string[]> = new Map();
  private incomingEdges: Map<string, string[]> = new Map();

  public register(rel: Relationship): void {
    this.relationships.set(rel.id, rel);

    // Index outgoing
    if (!this.outgoingEdges.has(rel.sourceId)) {
      this.outgoingEdges.set(rel.sourceId, []);
    }
    const outList = this.outgoingEdges.get(rel.sourceId)!;
    if (!outList.includes(rel.id)) outList.push(rel.id);

    // Index incoming
    if (!this.incomingEdges.has(rel.targetId)) {
      this.incomingEdges.set(rel.targetId, []);
    }
    const inList = this.incomingEdges.get(rel.targetId)!;
    if (!inList.includes(rel.id)) inList.push(rel.id);
  }

  public get(id: string): Relationship | undefined {
    return this.relationships.get(id);
  }

  public getOutgoingIds(sourceId: string): string[] {
    return this.outgoingEdges.get(sourceId) || [];
  }

  public getIncomingIds(targetId: string): string[] {
    return this.incomingEdges.get(targetId) || [];
  }

  public getAll(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  public clear(): void {
    this.relationships.clear();
    this.outgoingEdges.clear();
    this.incomingEdges.clear();
  }
}
