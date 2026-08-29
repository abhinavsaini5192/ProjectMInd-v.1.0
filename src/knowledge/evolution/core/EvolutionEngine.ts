import { CommitSnapshot } from '../models/CommitSnapshot';
import { CommitAnalyzer } from './CommitAnalyzer';
import { EvolutionRegistry } from './EvolutionRegistry';
import { EvolutionTimeline } from './EvolutionTimeline';
import { FeatureEvolutionTracker } from './FeatureEvolutionTracker';
import { ArchitectureEvolutionTracker } from './ArchitectureEvolutionTracker';
import { DependencyEvolutionTracker } from './DependencyEvolutionTracker';
import { SymbolEvolutionTracker } from './SymbolEvolutionTracker';
import { RefactorDetector } from './RefactorDetector';
import { EvolutionValidator } from '../validation/EvolutionValidator';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { COMMIT_PROCESSED, REFACTOR_DETECTED, EVOLUTION_UPDATED } from '../types/EvolutionEvents';

export class EvolutionEngine {
  constructor(
    private commitAnalyzer: CommitAnalyzer,
    private refactorDetector: RefactorDetector,
    private registry: EvolutionRegistry,
    private timeline: EvolutionTimeline,
    private featureTracker: FeatureEvolutionTracker,
    private architectureTracker: ArchitectureEvolutionTracker,
    private depTracker: DependencyEvolutionTracker,
    private symbolTracker: SymbolEvolutionTracker,
    private validator: EvolutionValidator,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processCommit(snapshot: CommitSnapshot): void {
    // 1. Analyze raw commit into semantic event
    const event = this.commitAnalyzer.analyze(snapshot);
    this.validator.validate(event);

    // 2. Register and timeline
    this.registry.register(event);
    this.timeline.appendEvent(event);

    // 3. Track sub-timelines
    for (const fId of snapshot.addedFeatureIds) {
      this.featureTracker.trackEvent(fId, event, 'Created');
    }
    for (const fId of snapshot.removedFeatureIds) {
      this.featureTracker.trackEvent(fId, event, 'Removed');
    }
    for (const symId of snapshot.modifiedSymbolIds) {
      this.symbolTracker.trackEvent(symId, event);
    }
    for (const depId of snapshot.addedDependencyIds) {
      this.depTracker.trackEvent(depId, event);
    }

    // 4. Detect Refactors
    const refactors = this.refactorDetector.detect(snapshot);
    for (const ref of refactors) {
      this.dispatcher.publish(REFACTOR_DETECTED, ref);
    }

    // 5. Publish global events
    this.dispatcher.publish(COMMIT_PROCESSED, { commitHash: snapshot.commitHash });
    this.dispatcher.publish(EVOLUTION_UPDATED, { eventId: event.id });
  }

  public getTimeline(): EvolutionTimeline { return this.timeline; }
}
