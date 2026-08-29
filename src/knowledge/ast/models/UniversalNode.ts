import { NodeKind } from './NodeKind';

export interface SourceLocation {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
  filePath: string;
}

export interface UniversalNode {
  id: string; // UUID
  kind: NodeKind;
  language: string;
  name?: string;
  location: SourceLocation;
  parentId?: string;
  children: UniversalNode[]; // Can be IDs or nested objects depending on storage, here we use nested for in-memory AST
  attributes: Record<string, any>;
  metadata: Record<string, any>;
  version: number;
  hash: string;
  parserVersion: string;
  rawText?: string; // Optional raw string backing this node
}
