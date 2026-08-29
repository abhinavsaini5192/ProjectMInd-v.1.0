import { Symbol } from '../models/Symbol';

export class SymbolValidator {
  public validate(symbols: Symbol[]): boolean {
    const ids = new Set<string>();
    
    for (const sym of symbols) {
      if (ids.has(sym.id)) {
        throw new Error(`Duplicate Symbol ID detected: ${sym.id}`);
      }
      ids.add(sym.id);

      if (!sym.name || sym.name.trim() === '') {
        throw new Error(`Symbol ${sym.id} is missing a name`);
      }
      if (!sym.language || !sym.repository || !sym.workspace) {
        throw new Error(`Symbol ${sym.id} has broken ownership chains or metadata`);
      }
    }
    
    return true;
  }
}
