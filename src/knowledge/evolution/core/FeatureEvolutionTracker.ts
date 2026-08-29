import { EvolutionEvent } from '../models/EvolutionEvent';
import { FeatureEvolution } from '../models/Timelines';

export class FeatureEvolutionTracker {
  private features: Map<string, FeatureEvolution> = new Map();

  public trackEvent(featureId: string, event: EvolutionEvent, state: 'Created' | 'Expanded' | 'Refactored' | 'Split' | 'Merged' | 'Deprecated' | 'Removed'): void {
    if (!this.features.has(featureId)) {
      this.features.set(featureId, {
        featureId,
        history: [],
        lifecycleState: 'Created'
      });
    }

    const tracker = this.features.get(featureId)!;
    tracker.history.push(event);
    tracker.lifecycleState = state;
  }

  public getHistory(featureId: string): FeatureEvolution | undefined {
    return this.features.get(featureId);
  }
}
