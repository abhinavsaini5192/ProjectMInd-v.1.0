import { EvolutionEvent } from '../models/EvolutionEvent';

export class EvolutionCache {
  private cache: Map<string, EvolutionEvent> = new Map();

  public set(id: string, event: EvolutionEvent): void { this.cache.set(id, event); }
  public get(id: string): EvolutionEvent | undefined { return this.cache.get(id); }
}
