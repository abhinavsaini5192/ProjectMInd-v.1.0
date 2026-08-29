import { Symbol } from '../models/Symbol';
import { SymbolKind } from '../models/SymbolKind';
import { SymbolRegistry } from './SymbolRegistry';
import { SymbolIndexer } from './SymbolIndexer';

export class SymbolResolver {
  constructor(
    private registry: SymbolRegistry,
    private indexer: SymbolIndexer
  ) {}

  public resolveById(id: string): Symbol | undefined {
    return this.registry.get(id);
  }

  public resolveByScope(scope: string): Symbol[] {
    return this.indexer.getByScope(scope);
  }

  public resolveByKind(kind: SymbolKind): Symbol[] {
    return this.registry.getAll().filter(s => s.kind === kind);
  }
}
