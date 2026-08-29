import { EvolutionEvent } from '../models/EvolutionEvent';
import { ArchitectureEvolution } from '../models/Timelines';

export class ArchitectureEvolutionTracker {
  private layers: Map<string, ArchitectureEvolution> = new Map();

  public trackEvent(layerId: string, event: EvolutionEvent): void {
    if (!this.layers.has(layerId)) {
      this.layers.set(layerId, {
        layerId,
        history: []
      });
    }
    this.layers.get(layerId)!.history.push(event);
  }
}
