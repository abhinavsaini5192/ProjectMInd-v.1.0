import { Relationship } from '../models/Relationship';

export class RelationshipCache {
  private cache: Map<string, Relationship> = new Map();

  public get(id: string): Relationship | undefined {
    return this.cache.get(id);
  }

  public set(id: string, rel: Relationship): void {
    this.cache.set(id, rel);
  }
}
