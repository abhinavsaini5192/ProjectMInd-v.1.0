import { Symbol } from '../models/Symbol';
import { SymbolKind } from '../models/SymbolKind';
import { SourceLocation } from '../../ast/models/UniversalNode';
import { SymbolIdentityManager } from './SymbolIdentityManager';
import { SymbolVersionManager } from './SymbolVersionManager';

export class SymbolFactory {
  constructor(
    private identity: SymbolIdentityManager,
    private versionManager: SymbolVersionManager
  ) {}

  public create(
    kind: SymbolKind,
    name: string,
    language: string,
    repository: string,
    workspace: string,
    scope: string,
    visibility: 'public' | 'private' | 'protected' | 'internal',
    location: SourceLocation,
    rawText: string,
    documentation: string = '',
    parentId?: string
  ): Symbol {
    const id = this.identity.generateId(language, repository, scope, name);
    const hash = this.versionManager.generateHash(rawText);
    const now = Date.now();

    return {
      id,
      kind,
      name,
      language,
      repository,
      workspace,
      scope,
      visibility,
      documentation,
      location,
      version: 1,
      hash,
      created: now,
      updated: now,
      history: ['Created'],
      parentId
    };
  }
}
