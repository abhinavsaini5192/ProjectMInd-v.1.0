import { describe, it, expect, beforeEach } from 'vitest';
import { EvolutionEngine } from '../../src/knowledge/evolution/core/EvolutionEngine';
import { CommitAnalyzer } from '../../src/knowledge/evolution/core/CommitAnalyzer';
import { ChangeClassifier } from '../../src/knowledge/evolution/core/ChangeClassifier';
import { ChangeImpactAnalyzer } from '../../src/knowledge/evolution/core/ChangeImpactAnalyzer';
import { RefactorDetector } from '../../src/knowledge/evolution/core/RefactorDetector';
import { EvolutionRegistry } from '../../src/knowledge/evolution/core/EvolutionRegistry';
import { EvolutionTimeline } from '../../src/knowledge/evolution/core/EvolutionTimeline';
import { FeatureEvolutionTracker } from '../../src/knowledge/evolution/core/FeatureEvolutionTracker';
import { ArchitectureEvolutionTracker } from '../../src/knowledge/evolution/core/ArchitectureEvolutionTracker';
import { DependencyEvolutionTracker } from '../../src/knowledge/evolution/core/DependencyEvolutionTracker';
import { SymbolEvolutionTracker } from '../../src/knowledge/evolution/core/SymbolEvolutionTracker';
import { EvolutionValidator } from '../../src/knowledge/evolution/validation/EvolutionValidator';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { CommitSnapshot } from '../../src/knowledge/evolution/models/CommitSnapshot';
import { ChangeClassification, RefactorType } from '../../src/knowledge/evolution/types/EvolutionTypes';

describe('Repository Evolution Engine', () => {
  let engine: EvolutionEngine;
  let dispatcher: KernelEventDispatcher;
  let timeline: EvolutionTimeline;

  beforeEach(() => {
    const classifier = new ChangeClassifier();
    const impactAnalyzer = new ChangeImpactAnalyzer();
    const commitAnalyzer = new CommitAnalyzer(classifier, impactAnalyzer);
    const refactorDetector = new RefactorDetector();
    const registry = new EvolutionRegistry();
    timeline = new EvolutionTimeline();
    const featureTracker = new FeatureEvolutionTracker();
    const architectureTracker = new ArchitectureEvolutionTracker();
    const depTracker = new DependencyEvolutionTracker();
    const symbolTracker = new SymbolEvolutionTracker();
    const validator = new EvolutionValidator();
    dispatcher = new KernelEventDispatcher();

    engine = new EvolutionEngine(
      commitAnalyzer, refactorDetector, registry, timeline, featureTracker, 
      architectureTracker, depTracker, symbolTracker, validator, dispatcher
    );
  });

  it('should process a commit, classify it, and build timeline', () => {
    const snapshot: CommitSnapshot = {
      commitHash: 'commit_123',
      author: 'Jane',
      timestamp: Date.now(),
      message: 'feat: add awesome new feature\nRefactor old code.',
      changedFiles: ['src/new.ts', 'src/old.ts'],
      addedSymbolIds: ['sym_new'],
      removedSymbolIds: [],
      modifiedSymbolIds: ['sym_old'],
      addedDependencyIds: [],
      removedDependencyIds: [],
      addedFeatureIds: ['feat_awesome'],
      removedFeatureIds: []
    };

    engine.processCommit(snapshot);

    const time = engine.getTimeline().getTimeline();
    expect(time.totalCommitsAnalyzed).toBe(1);
    expect(time.events[0].classifications).toContain(ChangeClassification.Feature);
    expect(time.events[0].classifications).toContain(ChangeClassification.Refactor);
  });

  it('should infer an Extract Method refactor', () => {
    let refactorEvent: any = null;
    dispatcher.subscribe('Evolution:RefactorDetected', (data) => {
      refactorEvent = data;
    });

    const snapshot: CommitSnapshot = {
      commitHash: 'commit_extract',
      author: 'Jane',
      timestamp: Date.now(),
      message: 'extract method',
      changedFiles: [],
      addedSymbolIds: ['sym_helper'], // New method added
      removedSymbolIds: [],
      modifiedSymbolIds: ['sym_parent'], // Old method modified (logic stripped)
      addedDependencyIds: [],
      removedDependencyIds: [],
      addedFeatureIds: [],
      removedFeatureIds: []
    };

    engine.processCommit(snapshot);

    expect(refactorEvent).not.toBeNull();
    expect(refactorEvent.type).toBe(RefactorType.ExtractMethod);
    expect(refactorEvent.sourceSymbolIds[0]).toBe('sym_parent');
    expect(refactorEvent.targetSymbolIds[0]).toBe('sym_helper');
  });

  it('should infer a Rename/Move refactor', () => {
    let refactorEvent: any = null;
    dispatcher.subscribe('Evolution:RefactorDetected', (data) => {
      refactorEvent = data;
    });

    const snapshot: CommitSnapshot = {
      commitHash: 'commit_rename',
      author: 'Jane',
      timestamp: Date.now(),
      message: 'rename method',
      changedFiles: [],
      addedSymbolIds: ['sym_new_name'],
      removedSymbolIds: ['sym_old_name'], // one dropped, one added
      modifiedSymbolIds: [],
      addedDependencyIds: [],
      removedDependencyIds: [],
      addedFeatureIds: [],
      removedFeatureIds: []
    };

    engine.processCommit(snapshot);

    expect(refactorEvent).not.toBeNull();
    expect(refactorEvent.type).toBe(RefactorType.Rename);
  });
});
