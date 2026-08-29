import { EvolutionEvent } from '../models/EvolutionEvent';

export class EvolutionSerializer {
  public serialize(event: EvolutionEvent): string {
    return JSON.stringify(event, null, 2);
  }

  public deserialize(data: string): EvolutionEvent {
    return JSON.parse(data) as EvolutionEvent;
  }
}
