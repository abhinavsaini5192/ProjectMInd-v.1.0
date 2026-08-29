import { SymbolKind } from './SymbolKind';
import { SourceLocation } from '../../ast/models/UniversalNode';

export interface Symbol {
  id: string; // Stable Unique Identity
  kind: SymbolKind;
  name: string;
  language: string;
  repository: string;
  workspace: string;
  owner?: string; // TBD via code owners
  parentId?: string;
  scope: string; // Fully qualified namespace
  visibility: 'public' | 'private' | 'protected' | 'internal';
  documentation: string;
  location: SourceLocation;
  version: number;
  hash: string;
  created: number; // Timestamp
  updated: number; // Timestamp
  history: string[]; // Log of changes
}
