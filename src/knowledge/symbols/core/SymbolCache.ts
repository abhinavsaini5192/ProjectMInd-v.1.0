import { Symbol } from '../models/Symbol';

export class SymbolCache {
  private cache: Map<string, Symbol> = new Map();

  public get(id: string): Symbol | undefined {
    return this.cache.get(id);
  }

  public set(id: string, symbol: Symbol): void {
    this.cache.set(id, symbol);
  }

  public invalidate(id: string): void {
    this.cache.delete(id);
  }
}
