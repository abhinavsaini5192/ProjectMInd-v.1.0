import { Symbol } from '../models/Symbol';

export class SymbolSerializer {
  public serialize(symbol: Symbol): string {
    return JSON.stringify(symbol);
  }
}

export class SymbolDeserializer {
  public deserialize(json: string): Symbol {
    return JSON.parse(json) as Symbol;
  }
}
