import { EvolutionEvent } from '../models/EvolutionEvent';

export class EvolutionValidator {
  public validate(event: EvolutionEvent): void {
    if (!event.commitHash) throw new Error('EvolutionEvent missing commitHash');
    if (!event.id) throw new Error('EvolutionEvent missing ID');
    if (!event.impact) throw new Error('EvolutionEvent missing impact metrics');
  }
}
