import { UniversalNode, SourceLocation } from '../models/UniversalNode';
import { NodeKind } from '../models/NodeKind';
import crypto from 'crypto';

export class NodeFactory {
  public createNode(
    kind: NodeKind,
    language: string,
    location: SourceLocation,
    name?: string,
    rawText?: string
  ): UniversalNode {
    const id = crypto.randomUUID();
    
    // Hash is calculated deterministically based on structural identity
    const hashPayload = `${kind}:${language}:${name || 'anonymous'}:${rawText || ''}`;
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    return {
      id,
      kind,
      language,
      name,
      location,
      children: [],
      attributes: {},
      metadata: {},
      version: 1,
      hash,
      parserVersion: '1.0',
      rawText
    };
  }
}
