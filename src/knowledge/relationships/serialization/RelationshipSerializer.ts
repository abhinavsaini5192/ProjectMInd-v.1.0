import { Relationship } from '../models/Relationship';

export class RelationshipSerializer {
  public serialize(rel: Relationship): string {
    return JSON.stringify(rel);
  }
}

export class RelationshipDeserializer {
  public deserialize(json: string): Relationship {
    return JSON.parse(json) as Relationship;
  }
}
