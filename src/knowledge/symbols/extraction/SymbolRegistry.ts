import { Symbol } from '../models/Symbol';

export class SymbolRegistry {
  private symbols: Map<string, Symbol> = new Map();

  public register(symbol: Symbol): void {
    this.symbols.set(symbol.id, symbol);
  }

  public get(id: string): Symbol | undefined {
    return this.symbols.get(id);
  }

  public remove(id: string): void {
    this.symbols.delete(id);
  }

  public getAll(): Symbol[] {
    return Array.from(this.symbols.values());
  }

  public clear(): void {
    this.symbols.clear();
  }
}
