import { EvolutionEvent } from '../models/EvolutionEvent';

export class EvolutionRegistry {
  private events: Map<string, EvolutionEvent> = new Map();

  public register(event: EvolutionEvent): void {
    this.events.set(event.id, event);
  }

  public getEvent(id: string): EvolutionEvent | undefined {
    return this.events.get(id);
  }

  public getAllEvents(): EvolutionEvent[] {
    return Array.from(this.events.values());
  }
}
