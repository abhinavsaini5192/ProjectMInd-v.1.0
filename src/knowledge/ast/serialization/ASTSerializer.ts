import { UniversalNode } from '../models/UniversalNode';

export class ASTSerializer {
  public serialize(node: UniversalNode): string {
    return JSON.stringify(node);
  }
}

export class ASTDeserializer {
  public deserialize(json: string): UniversalNode {
    return JSON.parse(json) as UniversalNode;
  }
}
