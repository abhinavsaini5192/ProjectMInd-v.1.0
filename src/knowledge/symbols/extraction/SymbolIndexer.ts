import { Symbol } from '../models/Symbol';
import { SymbolRegistry } from './SymbolRegistry';

export class SymbolIndexer {
  private scopeIndex: Map<string, string[]> = new Map();

  constructor(private registry: SymbolRegistry) {}

  public index(symbol: Symbol): void {
    this.registry.register(symbol);

    if (!this.scopeIndex.has(symbol.scope)) {
      this.scopeIndex.set(symbol.scope, []);
    }
    
    // Prevent duplicate entries in scope array
    const scopeArr = this.scopeIndex.get(symbol.scope)!;
    if (!scopeArr.includes(symbol.id)) {
      scopeArr.push(symbol.id);
    }
  }

  public getByScope(scope: string): Symbol[] {
    const ids = this.scopeIndex.get(scope) || [];
    return ids.map(id => this.registry.get(id)!).filter(Boolean);
  }

  public clear(): void {
    this.registry.clear();
    this.scopeIndex.clear();
  }
}
