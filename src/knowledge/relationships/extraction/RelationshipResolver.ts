import { Relationship } from '../models/Relationship';
import { RelationshipType } from '../models/RelationshipType';
import { RelationshipRegistry } from './RelationshipRegistry';

export class RelationshipResolver {
  constructor(private registry: RelationshipRegistry) {}

  public resolveById(id: string): Relationship | undefined {
    return this.registry.get(id);
  }

  public getOutgoing(sourceId: string, filterType?: RelationshipType): Relationship[] {
    const edges = this.registry.getOutgoingIds(sourceId).map(id => this.registry.get(id)!);
    if (filterType) {
      return edges.filter(e => e.type === filterType);
    }
    return edges;
  }

  public getIncoming(targetId: string, filterType?: RelationshipType): Relationship[] {
    const edges = this.registry.getIncomingIds(targetId).map(id => this.registry.get(id)!);
    if (filterType) {
      return edges.filter(e => e.type === filterType);
    }
    return edges;
  }
}
