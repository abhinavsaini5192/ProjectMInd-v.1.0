import { EvolutionEvent } from '../models/EvolutionEvent';
import { DependencyEvolution } from '../models/Timelines';

export class DependencyEvolutionTracker {
  private deps: Map<string, DependencyEvolution> = new Map();

  public trackEvent(dependencyId: string, event: EvolutionEvent): void {
    if (!this.deps.has(dependencyId)) {
      this.deps.set(dependencyId, {
        dependencyId,
        history: []
      });
    }
    this.deps.get(dependencyId)!.history.push(event);
  }
}
