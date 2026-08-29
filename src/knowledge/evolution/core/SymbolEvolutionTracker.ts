import { EvolutionEvent } from '../models/EvolutionEvent';

export interface SymbolEvolution {
  symbolId: string;
  history: EvolutionEvent[];
}

export class SymbolEvolutionTracker {
  private symbols: Map<string, SymbolEvolution> = new Map();

  public trackEvent(symbolId: string, event: EvolutionEvent): void {
    if (!this.symbols.has(symbolId)) {
      this.symbols.set(symbolId, {
        symbolId,
        history: []
      });
    }
    this.symbols.get(symbolId)!.history.push(event);
  }
}
